import "./App.css";
import IPConverter from "./components/IPConverter";
import { useState, useEffect } from "react";
function App() {
  const [IPType, setIPType] = useState("IPV4");

  const handleIPTypeChange = (event) => {
    const value = event.target.value;
    setIPType(value);
    localStorage.setItem("IPType", value);
  };

  useEffect(() => {
    const storedIPType = localStorage.getItem("IPType");
    if (storedIPType) {
      setIPType(storedIPType);
    }
  }, []);

  return (
    <>
      <div>
        <label>
          <input
            type='radio'
            value='IPV4'
            checked={IPType === "IPV4"}
            onChange={handleIPTypeChange}
          />
          IPv4
        </label>
        <label>
          <input
            type='radio'
            value='IPV6'
            checked={IPType === "IPV6"}
            onChange={handleIPTypeChange}
          />
          IPv6
        </label>
      </div>
      {IPType === "IPV4" && <IPConverter type='IPV4' />}
      {IPType === "IPV6" && <IPConverter type='IPV6' />}
    </>
  );
}

export default App;
