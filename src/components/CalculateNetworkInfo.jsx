const CalculateNetworkInfo = ({ ip, subnetBits }) => {
  const { networkAddress, broadcastAddress, count } = calculateMask({
    ip,
    subnetBits,
  });

  return (
    <div>
      <div>Network Address: {networkAddress}</div>
      <div>Broadcast Address: {broadcastAddress}</div>
      <div>Count: {count}</div>
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
  const availableIPRange = `${networkAddress} - ${broadcastAddress}`;

  return {
    networkAddress,
    broadcastAddress,
    availableIPRange,
    count: Math.pow(2, 32 - subnetBits) - 2,
  };
};

import PropTypes from "prop-types";
CalculateNetworkInfo.propTypes = {
  ip: PropTypes.string.isRequired,
  subnetBits: PropTypes.string.isRequired,
};
export default CalculateNetworkInfo;
