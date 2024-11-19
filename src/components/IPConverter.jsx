import { useState, useEffect, Fragment } from "react";
import CalculateNetworkInfo from "./CalculateNetworkInfo";
import CopyButton from "./CopyButton";
import { IPTypes } from "./IPTypes";

const IPConverter = ({ type = "IPV4" }) => {
  const { defaultIP, binaryPartLength, radix, delimiter, width, _subnetBits } =
    IPTypes[type];

  const initialIP = defaultIP; // Set initial IP to all zeros (e.g., "0.0.0.0" or "::")

  const [inputIP, setInputIP] = useState(initialIP);
  const [binaryIP, setBinaryIP] = useState([]);
  const [expandedIP, setExpandedIP] = useState("");
  const [subnetBits, setSubnetBits] = useState(_subnetBits.toString());
  const [isValidIP, setIsValidIP] = useState(true);

  // Process the initial IP address when the component mounts
  useEffect(() => {
    processInputIP(initialIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processInputIP = (input) => {
    const sanitizedInput = input.replace(/[^a-fA-F\d.:]/g, "");
    setInputIP(sanitizedInput);
    if (type === "IPV6") {
      const isValid = validateIPv6(sanitizedInput);
      setIsValidIP(isValid);
      if (isValid) {
        const expanded = expandIPv6Address(sanitizedInput);
        setExpandedIP(expanded);
        const binary = ipv6ToBinary(expanded);
        setBinaryIP(binary);
      } else {
        setExpandedIP("");
        setBinaryIP([]);
      }
    } else {
      // Handle IPv4
      const isValid = validateIPv4(sanitizedInput);
      setIsValidIP(isValid);
      if (isValid) {
        const binary = ipv4ToBinary(sanitizedInput);
        setBinaryIP(binary);
        setExpandedIP(sanitizedInput);
      } else {
        setBinaryIP([]);
        setExpandedIP("");
      }
    }
  };

  const handleInputChange = (event) => {
    const input = event.target.value;
    processInputIP(input);
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

// Helper functions remain the same as before

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

function ipv6ToBinary(ip) {
  const expandedAddress = expandIPv6Address(ip);
  const blocks = expandedAddress.split(":");

  const binaryBlocks = blocks.map((block) => {
    let num = parseInt(block, 16);
    let binaryStr = num.toString(2).padStart(16, "0");
    return binaryStr;
  });

  return binaryBlocks;
}

function binaryToIPv6(binaryBlocks) {
  const blocks = binaryBlocks.map((binaryStr) => {
    let num = parseInt(binaryStr, 2);
    let hexStr = num.toString(16).padStart(4, "0");
    return hexStr;
  });
  return blocks.join(":");
}

// IPv4 helper functions

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

function ipv4ToBinary(ip) {
  const blocks = ip.split(".");
  const binaryBlocks = blocks.map((block) => {
    let num = parseInt(block, 10);
    let binaryStr = num.toString(2).padStart(8, "0");
    return binaryStr;
  });
  return binaryBlocks;
}

function binaryToIPv4(binaryBlocks) {
  const blocks = binaryBlocks.map((binaryStr) => {
    let num = parseInt(binaryStr, 2);
    return num.toString(10);
  });
  return blocks.join(".");
}

function isMask(partIndex, bitIndex, subnetBits, binaryPartLength) {
  return partIndex * binaryPartLength + bitIndex < parseInt(subnetBits);
}

import PropTypes from "prop-types";
IPConverter.propTypes = {
  type: PropTypes.string.isRequired,
};
export default IPConverter;
