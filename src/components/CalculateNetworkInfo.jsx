import PropTypes from "prop-types";

const CalculateNetworkInfo = ({ ip, subnetBits, type }) => {
  const {
    networkAddress,
    broadcastAddress,
    count,
    subnetMask,
    ipClass,
    ipUsage,
    devicesMayNotWorkProperly,
    subnetsAvailable,
  } = calculateMask({
    ip,
    subnetBits: parseInt(subnetBits, 10),
    type,
  });

  return (
    <div>
      {networkAddress && <div>Network ID: {networkAddress}</div>}
      {subnetMask && <div>Subnet Mask: {subnetMask}</div>}
      {broadcastAddress && <div>Broadcast Address: {broadcastAddress}</div>}
      {count !== null && count !== undefined && (
        <div>
          Devices Count: {formatBigInt(count)}
          {devicesMayNotWorkProperly && (
            <span> (Subnet mask length exceeds 64 bits; devices may not work properly)</span>
          )}
        </div>
      )}
      {ipClass && <div>IP Type: {ipClass}</div>}
      {ipUsage && <div>IP Usage: {ipUsage}</div>}
      {type === "IPV6" && (
        <div>
          {subnetsAvailable > 1n && (
            <div>Available subnets: {formatBigInt(subnetsAvailable)}</div>
          )}
          {subnetsAvailable === 1n && (
            <div>Cannot further divide into more subnets.</div>
          )}
          {subnetsAvailable === 0n && (
            <div>Cannot further divide into /64 subnets.</div>
          )}
        </div>
      )}
    </div>
  );
};

const calculateMask = ({ ip, subnetBits, type }) => {
  if (type === "IPV4") {
    return calculateIPv4Mask({ ip, subnetBits });
  } else if (type === "IPV6") {
    return calculateIPv6Mask({ ip, subnetBits });
  } else {
    // Return default values if the type is unrecognized
    return {
      networkAddress: null,
      broadcastAddress: null,
      subnetMask: null,
      count: null,
      ipClass: "Unknown",
      ipUsage: "Unknown",
    };
  }
};

const calculateIPv4Mask = ({ ip, subnetBits }) => {
  const binaryPartLength = 8;
  const radix = 10;
  const width = 4;
  const delimiter = ".";

  // Validate IPv4 address
  if (!validateIPv4(ip)) {
    return {
      networkAddress: null,
      broadcastAddress: null,
      subnetMask: null,
      count: null,
      ipClass: "Invalid IP",
      ipUsage: "Invalid IP",
    };
  }

  const ipParts = ip.split(delimiter);
  const ipBinary = ipParts
    .map((part) =>
      parseInt(part, radix).toString(2).padStart(binaryPartLength, "0")
    )
    .join(""); // Combine into a single binary string

  const subnetMaskBinary = "1"
    .repeat(subnetBits)
    .padEnd(width * binaryPartLength, "0");

  const networkAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(width * binaryPartLength, "0");
  const broadcastAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(width * binaryPartLength, "1");

  const reg = new RegExp(`.{${binaryPartLength}}`, "g");
  const networkAddress = networkAddressBinary
    .match(reg)
    .map((part) => parseInt(part, 2).toString(radix))
    .join(delimiter);
  const broadcastAddress = broadcastAddressBinary
    .match(reg)
    .map((part) => parseInt(part, 2).toString(radix))
    .join(delimiter);

  const subnetMaskParts = subnetMaskBinary
    .match(reg)
    .map((part) => parseInt(part, 2).toString(radix));
  const subnetMask = subnetMaskParts.join(delimiter);

  let ipClass = "";
  let ipUsage = "Public (Internet)";

  // Determine Class
  if (ipBinary.startsWith("0")) {
    ipClass = "Class A";
  } else if (ipBinary.startsWith("10")) {
    ipClass = "Class B";
  } else if (ipBinary.startsWith("110")) {
    ipClass = "Class C";
  } else if (ipBinary.startsWith("1110")) {
    ipClass = "Class D";
  } else if (ipBinary.startsWith("1111")) {
    ipClass = "Class E";
  }

  // Determine Usage
  // Priority: Specific ranges > General Classes
  const specialRanges = [
    { prefix: "0".repeat(32), name: "Unspecified" },
    { prefix: "00000000", name: "Current Network" }, // 0.0.0.0/8
    { prefix: "1".repeat(32), name: "Broadcast" },
    { prefix: "01111111", name: "Loopback" }, // 127.0.0.0/8
    { prefix: "00001010", name: "Private / ULA" }, // 10.0.0.0/8
    { prefix: "101011000001", name: "Private / ULA" }, // 172.16.0.0/12
    { prefix: "1100000010101000", name: "Private / ULA" }, // 192.168.0.0/16
    { prefix: "1010100111111110", name: "Link-Local" }, // 169.254.0.0/16
    { prefix: "0110010001", name: "Carrier-grade NAT (CGNAT)" }, // 100.64.0.0/10
    { prefix: "1110", name: "Multicast" }, // 224.0.0.0/4
    { prefix: "110000000000000000000010", name: "Documentation" }, // 192.0.2.0/24
    { prefix: "110001100011001101100100", name: "Documentation" }, // 198.51.100.0/24
    { prefix: "110010110000000001110001", name: "Documentation" }, // 203.0.113.0/24
    { prefix: "110001100001001", name: "Benchmarking" }, // 198.18.0.0/15
    { prefix: "110000000101100001100011", name: "6to4 Relay" }, // 192.88.99.0/24
    { prefix: "1111", name: "Reserved" } // 240.0.0.0/4
  ];

  for (const range of specialRanges) {
    if (ipBinary.startsWith(range.prefix)) {
      ipUsage = range.name;
      break;
    }
  }

  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    count: Math.pow(2, width * binaryPartLength - subnetBits) - 2,
    ipClass,
    ipUsage,
  };
};

const calculateIPv6Mask = ({ ip, subnetBits }) => {
  const binaryPartLength = 16;
  const radix = 16;
  const width = 8;
  const delimiter = ":";

  // Validate IPv6 address
  if (!validateIPv6(ip)) {
    return {
      networkAddress: null,
      broadcastAddress: null,
      subnetMask: null,
      count: null,
      ipClass: "Invalid IP",
      ipUsage: "Invalid IP",
    };
  }

  // Expand the IPv6 address
  const expandedIP = expandIPv6Address(ip);
  const ipParts = expandedIP.split(delimiter);
  const ipBinary = ipParts
    .map((part) =>
      parseInt(part, radix).toString(2).padStart(binaryPartLength, "0")
    )
    .join(""); // Combine into a single binary string

  const networkAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(width * binaryPartLength, "0");

  const reg = new RegExp(`.{${binaryPartLength}}`, "g");
  const networkAddress = networkAddressBinary
    .match(reg)
    .map((part) => parseInt(part, 2).toString(radix).padStart(4, "0"))
    .join(delimiter);

  // IPv6 uses prefix length instead of subnet mask
  const subnetMask = null; // Not applicable for IPv6

  // Determine IP Type and Usage
  let ipClass = "Global Unicast";
  let ipUsage = "Public";

  const specialRanges = [
    { prefix: "0".repeat(128), name: "Unspecified" }, // ::/128
    { prefix: "0".repeat(127) + "1", name: "Loopback" }, // ::1/128
    { prefix: "1111110", name: "Private / ULA" }, // fc00::/7
    { prefix: "1111111010", name: "Link-Local" }, // fe80::/10
    { prefix: "11111111", name: "Multicast" }, // ff00::/8
    { prefix: "00100000000000010000110110111000", name: "Documentation" }, // 2001:db8::/32
    { prefix: "0".repeat(80) + "1".repeat(16), name: "IPv4-mapped" }, // ::ffff:0:0/96
    { prefix: "0010000000000010", name: "6to4" }, // 2002::/16
    { prefix: "00000000011001001111111110011011" + "0".repeat(64), name: "NAT64" } // 64:ff9b::/96
  ];

  let matched = false;
  for (const range of specialRanges) {
    if (ipBinary.startsWith(range.prefix)) {
      ipClass = range.name;
      ipUsage = range.name; 
      matched = true;
      break;
    }
  }

  if (!matched) {
    if (ipBinary.startsWith("001")) { // 2000::/3
      ipClass = "Global Unicast";
      ipUsage = "Global Public Internet";
    } else {
      ipClass = "Reserved / Unassigned";
      ipUsage = "Reserved";
    }
  }

  // 计算可用设备数
  const count = BigInt(2) ** BigInt(128 - subnetBits);

    // Determine if devices may not work properly
    const devicesMayNotWorkProperly = subnetBits > 64;
  
    // Calculate number of subnets available
    let subnetsAvailable = 0;
    if (subnetBits < 64) {
      subnetsAvailable = BigInt(2) ** BigInt(64 - subnetBits);
    } else if (subnetBits === 64) {
      subnetsAvailable = 1n; // BigInt literal
    } else {
      subnetsAvailable = 0n;
    }
  
  return {
    networkAddress,
    broadcastAddress: null,
    subnetMask,
    count,
    ipClass,
    ipUsage,
    devicesMayNotWorkProperly,
    subnetsAvailable,
  };
};

// Function to expand IPv6 address
function expandIPv6Address(address) {
  if (!address || address.trim() === "") {
    return null;
  }

  let expandedAddress = "";
  const addressParts = address.split("::");

  if (address.indexOf("::") === -1) {
    // Address does not contain '::'
    const blocks = address.split(":");
    if (blocks.length !== 8) {
      return null;
    }
    expandedAddress = blocks
      .map((block) => ("0000" + block).slice(-4))
      .join(":");
  } else {
    // Address contains '::'
    const leftPart = addressParts[0] ? addressParts[0].split(":") : [];
    const rightPart = addressParts[1] ? addressParts[1].split(":") : [];

    const missingBlocks = 8 - (leftPart.length + rightPart.length);
    if (missingBlocks < 0) {
      return null;
    }
    const zeros = Array(missingBlocks).fill("0000");

    const newBlocks = leftPart.concat(zeros).concat(rightPart);

    expandedAddress = newBlocks
      .map((block) => ("0000" + block).slice(-4))
      .join(":");
  }

  return expandedAddress;
}

// Function to validate IPv6 address
function validateIPv6(address) {
  if (!address || address.trim() === "") {
    return false;
  }

  try {
    const expandedAddress = expandIPv6Address(address);
    if (!expandedAddress) {
      return false;
    }
    const blocks = expandedAddress.split(":");
    if (blocks.length !== 8) {
      return false;
    }
    for (const block of blocks) {
      if (!/^[0-9a-fA-F]{4}$/.test(block)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

// Function to validate IPv4 address
function validateIPv4(address) {
  const blocks = address.split(".");
  if (blocks.length !== 4) {
    return false;
  }
  for (const block of blocks) {
    const num = parseInt(block, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return false;
    }
  }
  return true;
}

function formatBigInt(bigint) {
  return bigint.toLocaleString();
};

CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;