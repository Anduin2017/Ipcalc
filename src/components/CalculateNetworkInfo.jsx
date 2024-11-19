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
    type
  });

  return (
    <div>
      <div>Network ID: {networkAddress}</div>
      <div>Subnet Mask: {subnetMask}</div>
      <div>Broadcast Address: {broadcastAddress}</div>
      <div>Devices Count: {count}</div>
      <div>IP Class: {ipClass}</div>
      <div>IP Usage: {ipUsage}</div>
    </div>
  );
};

const calculateMask = ({ ip, subnetBits,type }) => {
  const { binaryPartLength, radix,width, delimiter } = IPTypes[type];

  const ipParts = ip.split(delimiter);
  const ipBinary = ipParts.map((part) =>
    parseInt(part,radix).toString(2).padStart(binaryPartLength, "0")
  ).join(""); // Combine into a single binary string
  const subnetMaskBinary = "1".repeat(subnetBits).padEnd(width * binaryPartLength, "0");

  const networkAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(width * binaryPartLength, "0");
  const broadcastAddressBinary = ipBinary
    .substring(0, subnetBits)
    .padEnd(width * binaryPartLength, "1");

  const reg =  new RegExp(`.{${binaryPartLength}}`,'g');
  const networkAddress = networkAddressBinary.match(reg)
    .map((part) => parseInt(part, 2).toString(radix))
    .join(delimiter);
  const broadcastAddress = broadcastAddressBinary.match(reg)
    .map((part) => parseInt(part, 2).toString(radix))
    .join(delimiter);

  const subnetMaskParts = subnetMaskBinary.match(reg)
    .map((part) => parseInt(part, 2).toString(radix));
  const subnetMask = subnetMaskParts.join(delimiter);

  let ipClass = "";
  let ipUsage = "Public";
  let localLanReserved = [
    "00001010",
    "101011000001",
    "1100000010101000"
  ]
  let localhostReserved = "01111111";

  if (ipBinary.startsWith("0")) {
    ipClass = "Class A";
    ipUsage = ipUsage + " (Large Network)";
  } else if (ipBinary.startsWith("10")) {
    ipClass = "Class B";
    ipUsage = ipUsage + " (Medium Network)";
  } else if (ipBinary.startsWith("110")) {
    ipClass = "Class C";
    ipUsage = ipUsage + " (Small Network)";
  } else if (ipBinary.startsWith("1110")) {
    ipClass = "Class D";
    ipUsage = "Reserved for Multicast";
  } else if (ipBinary.startsWith("1111")) {
    ipClass = "Class E";
    ipUsage = "Reserved";
  }

  for (let i = 0; i < localLanReserved.length; i++) {
    let reserved = localLanReserved[i];
    if (ipBinary.startsWith(reserved)) {
      ipUsage = "Local Area Network (LAN)";
      if (subnetBits < reserved.length) {
        ipUsage = ipUsage + " (Unusable)";
      }
      break;
    }
  }

  if (ipBinary.startsWith(localhostReserved)) {
    ipUsage = "Localhost Loopback";
    if (subnetBits < localhostReserved.length) {
      ipUsage = ipUsage + " (Unusable)";
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

import PropTypes from "prop-types";
CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;
