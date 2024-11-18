import "./App.css";
import IPConverter from "./components/IPConverter";
import { useState } from "react";
function App() {
  const [selectedOption, setSelectedOption] = useState("IPV4");

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };
  return (
    <>
      <div>
        <label>
          <input
            type='radio'
            value='IPV4'
            checked={selectedOption === "IPV4"}
            onChange={handleOptionChange}
          />
          IPv4
        </label>
        <label>
          <input
            type='radio'
            value='IPV6'
            checked={selectedOption === "IPV6"}
            onChange={handleOptionChange}
          />
          IPv6
        </label>
      </div>
      <div className='card'>
        {selectedOption === "IPV4" && <IPConverter type='IPV4' />}
      </div>
      <div className='card'>
        {selectedOption === "IPV6" && <IPConverter type='IPV6' />}
      </div>
    </>
  );
}

export default App;
