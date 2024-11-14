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
    const input = event.target.value;
    setInputIP(input);
    if (validateIP(input)) {
      const binaryIP = convertToBinary(input);
      setBinaryIP(binaryIP);
      setDecimalIP(convertToDecimal(binaryIP));
      setIsValidIP(true);
    } else {
      setBinaryIP(["00000000", "00000000", "00000000", "00000000"]);
      setDecimalIP("0.0.0.0");
      setIsValidIP(false);
    }
  };

  const convertToDecimal = (binaryIP) => {
    const decimalArray = binaryIP.map((binaryPart) => parseInt(binaryPart, 2));
    return decimalArray.join(".");
  };

  const convertToBinary = (decimalIP) => {
    const decimalArray = decimalIP.split(".");
    const binaryArray = decimalArray.map((decimalPart) => {
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

  return (
    <div>
      <div>
        <p>
          <input
            type='text'
            value={inputIP}
            style={{ color: isValidIP ? "black" : "red" }}
            onChange={handleInputChange}
          />
          /
          <input
            type='number'
            value={subnetBits}
            max={32}
            style={{ width: "50px" }}
            onChange={(e) => setSubnetBits(e.target.value)}
          />
        </p>
        {binaryIP.map((binaryPart, partIndex) => (
          <div key={partIndex}>
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
        <p>BinaryIP IP: {binaryIP}</p>
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