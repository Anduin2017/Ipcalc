import { useState } from "react";
import CalculateNetworkInfo from "./CalculateNetworkInfo";
const IPConverter = () => {
  const [binaryIP, setBinaryIP] = useState([
    "00000000",
    "00000000",
    "00000000",
    "00000000",
  ]);
  const [decimalIP, setDecimalIP] = useState("0.0.0.0");
  const [inputIP, setInputIP] = useState("0.0.0.0");
  const [subnetBits, setSubnetBits] = useState("24");
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
    const input = event.target.value.replace(/[^\d.]/g, '');;
    setInputIP(input);
    setIsValidIP(validateIP(input));
    const validatedIP = validateIPAddress(input);
    const binaryIP = convertToBinary(validatedIP);
    setBinaryIP(binaryIP);
    setDecimalIP(convertToDecimal(binaryIP));
  };

  const convertToDecimal = (binaryIP) => {
    const decimalArray = binaryIP.map((binaryPart) => parseInt(binaryPart, 2));
    return decimalArray.join(".");
  };

  const convertToBinary = (decimalIP) => {
    const decimalArray = decimalIP.split(".");
    const binaryArray = decimalArray.map((decimalPart) => {
      decimalPart = Math.min(decimalPart, 255)
      let binaryPart = parseInt(decimalPart).toString(2);
      while (binaryPart.length < 8) {
        binaryPart = "0" + binaryPart;
      }
      return binaryPart;
    });
    return binaryArray;
  };

  const validateIP = (ip) => {
    const pattern =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return pattern.test(ip);
  };
  const validateIPAddress = (ip) => {
    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(ip)) {
      return ip;
    }
  
    const ipParts = ip.split('.').filter(part => part !== '');
    while (ipParts.length < 4) {
      ipParts.push('0');
    }
    ipParts.length = 4;
    return ipParts.join('.');
  };
  
  
  return (
    <div>
      <div>
        <p>
          <input
            type='text'
            className="input"
            value={inputIP}
            style={{ color: isValidIP ? "" : "red" }}
            onChange={handleInputChange}
          />
          /
          <input
            type='number'
            className="input"
            value={subnetBits}
            max={32}
            min={0}
            style={{ width: "50px" }}
            onChange={(e) => setSubnetBits(e.target.value)}
          />
        </p>
        {binaryIP.map((binaryPart, partIndex) => (
          <div key={partIndex} className="flex">
            {binaryPart.split("").map((bit, bitIndex) => (
              <button
                key={bitIndex}
                className={
                  isMask(partIndex, bitIndex, subnetBits) ? "mask" : "subnet"
                }
                style={{
                  backgroundColor: bit === "0" ? "gray" : "orange",
                }}
                onClick={() => handleBitClick(partIndex, bitIndex)}
              >
                {bit}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div>
        <p>Decimal IP: {decimalIP}</p>
        <p>BinaryIP IP: {binaryIP.join('.')}</p>
        <CalculateNetworkInfo ip={inputIP.trim()} subnetBits={subnetBits} />
      </div>
    </div>
  );
};

const isMask = (partIndex, bitIndex, subnetBits) => {
  if (partIndex * 8 + bitIndex < parseInt(subnetBits)) return true;
  return false;
};
export default IPConverter;