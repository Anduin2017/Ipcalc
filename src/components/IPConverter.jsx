import { useState, Fragment  } from "react";
import CalculateNetworkInfo from "./CalculateNetworkInfo";
import CopyButton from "./CopyButton";
import { IPTypes } from "./IPTypes";

const IPConverter = ({type = "IPV4"}) => {
  const { defaultIP, binaryPartLength, radix, delimiter,width, _subnetBits,pattern } = IPTypes[type]

  const [binaryIP, setBinaryIP] = useState(defaultIP);
  const [decimalIP, setDecimalIP] = useState("0.0.0.0");
  const [inputIP, setInputIP] = useState("");
  const [subnetBits, setSubnetBits] = useState(_subnetBits.toString());
  const [isValidIP, setIsValidIP] = useState(true);

  const handleBitClick = (partIndex, bitIndex) => {
    const binaryArray = [...binaryIP];
    binaryArray[partIndex] = binaryArray[partIndex].split("");
    binaryArray[partIndex][bitIndex] =
      binaryArray[partIndex][bitIndex] === "0" ? "1" : "0";
    binaryArray[partIndex] = binaryArray[partIndex].join("");
    const newBinaryIP = binaryArray;
    setBinaryIP(newBinaryIP);
    setDecimalIP(convertToDecimal(newBinaryIP));
    setInputIP(convertToDecimal(newBinaryIP));
  };

  const handleInputChange = (event) => {
    const input = event.target.value.replace(/[^a-fA-F\d.:]/g, "");
    setInputIP(input);
    setIsValidIP(validateIP(input));
    const validatedIP = validateIPAddress(input);
    const binaryIP = convertToBinary(validatedIP);
    setBinaryIP(binaryIP);
    setDecimalIP(convertToDecimal(binaryIP));
  };

  const handleInputSubnetBits = (event) => {
    const input = event.target.value.replace(/[^\d]/g, "");
    setSubnetBits(input)
  }

  const convertToDecimal = (binaryIP) => {
    const decimalArray = binaryIP.map((binaryPart) => parseInt(binaryPart, 2).toString(radix));
    return decimalArray.join(delimiter);
  };

  const convertToBinary = (decimalIP) => {
    const decimalArray = decimalIP.split(delimiter);
    const binaryArray = decimalArray.map((decimalPart) => {
      let binaryPart = Math.min(parseInt(decimalPart, radix), Math.pow(2,binaryPartLength)-1).toString(2);
      while (binaryPart.length < binaryPartLength) {
        binaryPart = "0" + binaryPart;
      }
      return binaryPart;
    });
    return binaryArray;
  };

  const validateIP = (ip) => {
    return pattern.test(ip) ;
  };
  const validateIPAddress = (ip) => {
    if (type === 'IPV6' && ip.includes("::")) {
      const ipParts = ip.split(delimiter);
      const missingPartsCount = width - ipParts.length + 1;
      const missingParts = Array(missingPartsCount).fill("0000");
      const index = ipParts.findIndex((part) => part === "");
      ipParts.splice(index, 1, ...missingParts);
      return ipParts.join(delimiter);
    }

    if (validateIP(ip)) {
      return ip;
    }
    const ipParts = ip.split(delimiter).filter((part) => part !== "");
    while (ipParts.length < width) {
      ipParts.push("0");
    }
    ipParts.length = width;
    return ipParts.join(delimiter);
  };

  return (
    <div>
      <div>
        <p>
          <input
            type='text'
            className='input'
            value={inputIP}
            style={{ color: isValidIP ? "" : "red" }}
            onChange={handleInputChange}
          />
          /
          <input
            type='number'
            className='input'
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
                  className={
                    `bit-button ${isMask(partIndex, bitIndex, subnetBits,binaryPartLength)? "mask" : "subnet"} `
                  }
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
        <p>
          <CopyButton text={decimalIP} /> IP: {decimalIP}
        </p>
        <p>Binary IP: {binaryIP}</p>
        <CalculateNetworkInfo ip={inputIP.trim()} subnetBits={subnetBits} type={type} />
      </div>
    </div>
  );
};

const isMask = (partIndex, bitIndex, subnetBits,binaryPartLength) => {
  if (partIndex * binaryPartLength + bitIndex < parseInt(subnetBits)) return true;
  return false;
};

import PropTypes from "prop-types";
IPConverter.propTypes = {
  type: PropTypes.string.isRequired,
};
export default IPConverter;
