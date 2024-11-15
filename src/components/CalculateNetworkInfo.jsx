const CalculateNetworkInfo = ({ ip, subnetBits }) => {
  const { networkAddress, broadcastAddress, count, subnetMask, ipClass, classDescription } = calculateMask({
    ip,
    subnetBits,
  });

  return (
    <div>
      <div>Network ID: {networkAddress}</div>
      <div>Subnet Mask: {subnetMask}</div>
      <div>Broadcast Address: {broadcastAddress}</div>
      <div>Devices Count: {count}</div>
      <div>IP Class: {ipClass}</div>
      <div>Class Description: {classDescription}</div>
    </div>
  );
};

const calculateMask = ({ ip, subnetBits }) => {
  const ipParts = ip.split(".");
  const ipBinary = ipParts.map((part) =>
    parseInt(part).toString(2).padStart(8, "0")
  );
  const subnetMaskBinary = "1".repeat(subnetBits).padEnd(32, "0");

  const networkAddressBinary = ipBinary.map((part, index) => {
    const ipPartBinary = part.split("");
    const subnetMaskPartBinary = subnetMaskBinary
      .substring(index * 8, (index + 1) * 8)
      .split("");
    const networkPartBinary = ipPartBinary.map((bit, bitIndex) =>
      subnetMaskPartBinary[bitIndex] === "1" ? bit : "0"
    );
    return networkPartBinary.join("");
  });

  const broadcastAddressBinary = networkAddressBinary.map((part, index) => {
    const networkPartBinary = part.split("");
    const broadcastPartBinary = networkPartBinary.map((bit, bitIndex) =>
      subnetMaskBinary[index * 8 + bitIndex] === "1" ? bit : "1"
    );
    return broadcastPartBinary.join("");
  });

  const networkAddress = networkAddressBinary
    .map((part) => parseInt(part, 2))
    .join(".");
  const broadcastAddress = broadcastAddressBinary
    .map((part) => parseInt(part, 2))
    .join(".");

  const subnetMaskParts = [];
  for (let i = 0; i < 4; i++) {
    const binaryPart = subnetMaskBinary.substring(i * 8, (i + 1) * 8);
    subnetMaskParts.push(parseInt(binaryPart, 2));
  }
  const subnetMask = subnetMaskParts.join(".");

  // Determine IP Class based on the position of the first "0" in binary representation
  const firstOctetBinary = ipBinary[0];
  let ipClass = "";
  let classDescription = "";

  if (firstOctetBinary.startsWith("0")) {
    ipClass = "Class A";
    classDescription = "Class A addresses are for large networks.";
  } else if (firstOctetBinary.startsWith("10")) {
    ipClass = "Class B";
    classDescription = "Class B addresses are for medium-sized networks.";
  } else if (firstOctetBinary.startsWith("110")) {
    ipClass = "Class C";
    classDescription = "Class C addresses are for small networks.";
  } else if (firstOctetBinary.startsWith("1110")) {
    ipClass = "Class D";
    classDescription = "Class D addresses are reserved for multicast groups.";
  } else if (firstOctetBinary.startsWith("1111")) {
    ipClass = "Class E";
    classDescription = "Class E addresses are reserved for future use.";
  }

  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    count: Math.pow(2, 32 - subnetBits) - 2,
    ipClass,
    classDescription,
  };
};


import PropTypes from "prop-types";
CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;
