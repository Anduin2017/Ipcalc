const CalculateNetworkInfo = ({ ip, subnetBits }) => {
  const {
    networkAddress,
    broadcastAddress,
    count,
    subnetMask,
    ipClass,
    classDescription,
    ipUsage,
  } = calculateMask({
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
      <div>{classDescription}</div>
      <div>IP Usage: {ipUsage}</div>
    </div>
  );
};

const calculateMask = ({ ip, subnetBits }) => {
  const ipParts = ip.split(".");
  const ipBinary = ipParts.map((part) =>
    parseInt(part).toString(2).padStart(8, "0")
  ).join(""); // Combine into a single binary string
  const subnetMaskBinary = "1".repeat(subnetBits).padEnd(32, "0");

  const networkAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(32, "0");
  const broadcastAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(32, "1");

  const networkAddress = networkAddressBinary.match(/.{8}/g)
    .map((part) => parseInt(part, 2))
    .join(".");
  const broadcastAddress = broadcastAddressBinary.match(/.{8}/g)
    .map((part) => parseInt(part, 2))
    .join(".");

  const subnetMaskParts = subnetMaskBinary.match(/.{8}/g)
    .map((part) => parseInt(part, 2));
  const subnetMask = subnetMaskParts.join(".");

  let ipClass = "";
  let ipUsage = "Internet Address";
  let classDescription = "";

  if (ipBinary.startsWith("0")) {
    ipClass = "Class A";
    classDescription = "Class A addresses are for large networks.";

    if (ipBinary.startsWith("00001010")) {
      // 10.0.0.0/8
      ipUsage = "Local LAN";
      if (subnetBits < 8) {
        ipUsage = ipUsage + " (Unusable)";
    }
    if (ipBinary.startsWith("01111111")) {
      // 127.0.0.0/8
      ipUsage = "Localhost";
      if (subnetBits < 8) {
        ipUsage = ipUsage + " (Unusable)";
      }
    }

  } else if (ipBinary.startsWith("10")) {
    ipClass = "Class B";
    classDescription = "Class B addresses are for medium networks.";

    if (ipBinary.startsWith("101011000001")) {
      // 172.16.0.0/12
      ipUsage = "local LAN";
      if (subnetBits < 12) {
        ipUsage = ipUsage + " (Unusable)";
      }
    }

  } else if (ipBinary.startsWith("110")) {
    ipClass = "Class C";
    classDescription = "Class C addresses are for small networks.";

    if (ipBinary.startsWith("1100000010101000")) {
      // 192.168.0.0/16
      ipUsage = "Local LAN";
      if (subnetBits < 16) {
        ipUsage = ipUsage + " (Unusable)";
    }

  } else if (ipBinary.startsWith("1110")) {
    ipClass = "Class D";
    classDescription = "Class D addresses are reserved for multicast.";
  } else if (ipBinary.startsWith("1111")) {
    ipClass = "Class E";
    classDescription = "Class E addresses are reserved.";
  }

  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    count: Math.pow(2, 32 - subnetBits) - 2,
    ipClass,
    classDescription,
    ipUsage,
  };
};

import PropTypes from "prop-types";
CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;
