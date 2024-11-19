// IPTypes.js
export const IPTypes = {
    IPV4: {
      defaultIP: "0.0.0.0",
      binaryPartLength: 8,
      radix: 10,
      delimiter: ".",
      width: 4,
      _subnetBits: 24,
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
    },
    IPV6: {
      defaultIP: "::",
      binaryPartLength: 16,
      radix: 16,
      delimiter: ":",
      width: 8,
      _subnetBits: 64,
      pattern: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    },
  };
  