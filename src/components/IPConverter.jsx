import { useState, Fragment } from "react";
import CalculateNetworkInfo from "./CalculateNetworkInfo";
import CopyButton from "./CopyButton";
import { IPTypes } from "./IPTypes";

const IPConverter = ({ type = "IPV4" }) => {
  const { binaryPartLength, _subnetBits } =
    IPTypes[type];

  const [inputIP, setInputIP] = useState("");
  const [binaryIP, setBinaryIP] = useState([]);
  const [expandedIP, setExpandedIP] = useState("");
  const [subnetBits, setSubnetBits] = useState(_subnetBits.toString());
  const [isValidIP, setIsValidIP] = useState(true);

  const handleInputChange = (event) => {
    const input = event.target.value.replace(/[^a-fA-F\d.:]/g, "");
    setInputIP(input);
    if (type === "IPV6") {
      const isValid = validateIPv6(input);
      setIsValidIP(isValid);
      if (isValid) {
        const expanded = expandIPv6Address(input);
        setExpandedIP(expanded);
        const binary = ipv6ToBinary(expanded);
        setBinaryIP(binary);
      } else {
        setExpandedIP("");
        setBinaryIP([]);
      }
    } else {
      // Handle IPv4
      const isValid = validateIPv4(input);
      setIsValidIP(isValid);
      if (isValid) {
        const binary = ipv4ToBinary(input);
        setBinaryIP(binary);
        setExpandedIP(input);
      } else {
        setBinaryIP([]);
        setExpandedIP("");
      }
    }
  };

  const handleBitClick = (partIndex, bitIndex) => {
    const binaryArray = [...binaryIP];
    const binaryPart = binaryArray[partIndex];
    const bitChars = binaryPart.split("");
    bitChars[bitIndex] = bitChars[bitIndex] === "0" ? "1" : "0";
    binaryArray[partIndex] = bitChars.join("");
    setBinaryIP(binaryArray);

    // Now, convert binaryArray back to IP address
    if (type === "IPV6") {
      const newIPv6 = binaryToIPv6(binaryArray);
      setExpandedIP(newIPv6);
      setInputIP(newIPv6);
    } else {
      const newIPv4 = binaryToIPv4(binaryArray);
      setExpandedIP(newIPv4);
      setInputIP(newIPv4);
    }
  };

  const handleInputSubnetBits = (event) => {
    const input = event.target.value.replace(/[^\d]/g, "");
    setSubnetBits(input);
  };

  return (
    <>
      <div>
        <p>
          <input
            type="text"
            className="input"
            value={inputIP}
            style={{ color: isValidIP ? "" : "red" }}
            onChange={handleInputChange}
          />
          /
          <input
            type="number"
            className="input"
            value={subnetBits}
            min={0}
            style={{ width: "50px" }}
            onChange={(e) => handleInputSubnetBits(e)}
          />
        </p>
        <div className={`buttons-grid ${type}`}>
          {binaryIP.map((binaryPart, partIndex) => (
            <Fragment key={partIndex}>
              {binaryPart.split("").map((bit, bitIndex) => (
                <button
                  key={bitIndex}
                  className={`bit-button ${
                    isMask(partIndex, bitIndex, subnetBits, binaryPartLength)
                      ? "mask"
                      : "subnet"
                  } `}
                  style={{
                    backgroundColor: bit === "0" ? "gray" : "orange",
                  }}
                  onClick={() => handleBitClick(partIndex, bitIndex)}
                >
                  {bit}
                </button>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
      <div>
        <p className="flex">
          <span>
            <CopyButton text={expandedIP} /> IP: {expandedIP}
          </span>
          <span>
            <CopyButton text={binaryIP.join(" ")} /> Binary IP
          </span>
        </p>
        <CalculateNetworkInfo
          ip={expandedIP.trim()}
          subnetBits={subnetBits}
          type={type}
        />
      </div>
    </>
  );
};

function validateIPv6(address) {
  try {
    const expandedAddress = expandIPv6Address(address);
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

function expandIPv6Address(address) {
  var expandedAddress = "";
  var addressParts = address.split("::");

  if (address.indexOf("::") === -1) {
    // Address does not contain '::', pad zeros
    var blocks = address.split(":");
    if (blocks.length !== 8) {
      throw new Error("Invalid IPv6 address");
    }
    expandedAddress = blocks
      .map(function (block) {
        return ("0000" + block).slice(-4);
      })
      .join(":");
  } else {
    // Address contains '::'
    var leftPart = addressParts[0] ? addressParts[0].split(":") : [];
    var rightPart = addressParts[1] ? addressParts[1].split(":") : [];

    var missingBlocks = 8 - (leftPart.length + rightPart.length);
    if (missingBlocks < 0) {
      throw new Error("Invalid IPv6 address");
    }
    var zeros = [];
    for (var i = 0; i < missingBlocks; i++) {
      zeros.push("0000");
    }

    var newBlocks = leftPart.concat(zeros).concat(rightPart);

    expandedAddress = newBlocks
      .map(function (block) {
        return ("0000" + block).slice(-4);
      })
      .join(":");
  }

  return expandedAddress;
}

function ipv6ToBinary(ip) {
  var expandedAddress = expandIPv6Address(ip);
  var blocks = expandedAddress.split(":");

  var binaryBlocks = blocks.map(function (block) {
    var num = parseInt(block, 16);
    var binaryStr = num.toString(2);
    while (binaryStr.length < 16) {
      binaryStr = "0" + binaryStr;
    }
    return binaryStr;
  });

  return binaryBlocks;
}

function binaryToIPv6(binaryBlocks) {
  var blocks = binaryBlocks.map(function (binaryStr) {
    var num = parseInt(binaryStr, 2);
    var hexStr = num.toString(16);
    while (hexStr.length < 4) {
      hexStr = "0" + hexStr;
    }
    return hexStr;
  });
  return blocks.join(":");
}

function isMask(partIndex, bitIndex, subnetBits, binaryPartLength) {
  if (partIndex * binaryPartLength + bitIndex < parseInt(subnetBits))
    return true;
  return false;
}

// Similar functions for IPv4
function validateIPv4(address) {
  var blocks = address.split(".");
  if (blocks.length !== 4) {
    return false;
  }
  for (const block of blocks) {
    var num = parseInt(block, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      return false;
    }
  }
  return true;
}

function ipv4ToBinary(ip) {
  var blocks = ip.split(".");
  var binaryBlocks = blocks.map(function (block) {
    var num = parseInt(block, 10);
    var binaryStr = num.toString(2);
    while (binaryStr.length < 8) {
      binaryStr = "0" + binaryStr;
    }
    return binaryStr;
  });
  return binaryBlocks;
}

function binaryToIPv4(binaryBlocks) {
  var blocks = binaryBlocks.map(function (binaryStr) {
    var num = parseInt(binaryStr, 2);
    return num.toString(10);
  });
  return blocks.join(".");
}

import PropTypes from "prop-types";
IPConverter.propTypes = {
  type: PropTypes.string.isRequired,
};
export default IPConverter;
