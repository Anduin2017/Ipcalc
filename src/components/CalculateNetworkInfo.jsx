import { IPTypes } from "./IPTypes";

const CalculateNetworkInfo = ({ ip, subnetBits, type }) => {
  const {
    networkAddress,
    broadcastAddress,
    count,
    subnetMask,
    ipClass,
    ipUsage,
  } = calculateMask({
    ip,
    subnetBits,
    type,
  });

  return (
    <div>
      {networkAddress && <div>Network ID: {networkAddress}</div>}
      {subnetMask && <div>Subnet Mask: {subnetMask}</div>}
      {broadcastAddress && <div>Broadcast Address: {broadcastAddress}</div>}
      {count !== null && count !== undefined && (
        <div>Devices Count: {count}</div>
      )}
      {ipClass && <div>IP Type: {ipClass}</div>}
      {ipUsage && <div>IP Usage: {ipUsage}</div>}
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
  let ipUsage = "Public";

  if (ipBinary.startsWith("0")) {
    ipClass = "Class A";
    ipUsage += " (Large Network)";
  } else if (ipBinary.startsWith("10")) {
    ipClass = "Class B";
    ipUsage += " (Medium Network)";
  } else if (ipBinary.startsWith("110")) {
    ipClass = "Class C";
    ipUsage += " (Small Network)";
  } else if (ipBinary.startsWith("1110")) {
    ipClass = "Class D";
    ipUsage = "Reserved for Multicast";
  } else if (ipBinary.startsWith("1111")) {
    ipClass = "Class E";
    ipUsage = "Reserved";
  }

  const localLanReserved = ["00001010", "101011000001", "1100000010101000"];
  const localhostReserved = "01111111";

  for (let i = 0; i < localLanReserved.length; i++) {
    let reserved = localLanReserved[i];
    if (ipBinary.startsWith(reserved)) {
      ipUsage = "Local Area Network (LAN)";
      if (subnetBits < reserved.length) {
        ipUsage += " (Unusable)";
      }
      break;
    }
  }

  if (ipBinary.startsWith(localhostReserved)) {
    ipUsage = "Localhost Loopback";
    if (subnetBits < localhostReserved.length) {
      ipUsage += " (Unusable)";
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

  const subnetMaskBinary = "1"
    .repeat(subnetBits)
    .padEnd(width * binaryPartLength, "0");

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
  let ipClass = "";
  let ipUsage = "";

  const first16Bits = ipBinary.substring(0, 16);

  if (ipBinary === "0".repeat(128)) {
    ipClass = "Unspecified Address";
    ipUsage = "Cannot be assigned";
  } else if (ipBinary.startsWith("0".repeat(127) + "1")) {
    ipClass = "Loopback Address";
    ipUsage = "Localhost";
  } else if (ipBinary.startsWith("1111111010")) {
    ipClass = "Link-Local Unicast";
    ipUsage = "Used on a single link";
  } else if (ipBinary.startsWith("1111110")) {
    ipClass = "Unique Local Unicast";
    ipUsage = "Private addressing";
  } else if (ipBinary.startsWith("11111111")) {
    ipClass = "Multicast";
    ipUsage = "Multicast addressing";
  } else {
    ipClass = "Global Unicast";
    ipUsage = "Public addressing";
  }

  return {
    networkAddress,
    broadcastAddress: null, // IPv6 does not have broadcast addresses
    subnetMask,
    count: null, // Devices count is not practical in IPv6
    ipClass,
    ipUsage,
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
  } catch (e) {
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

import PropTypes from "prop-types";
CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;
