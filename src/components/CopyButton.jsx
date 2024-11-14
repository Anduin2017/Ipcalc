import copyIcon from '../assets/copy.svg';
import { useState } from "react";

const CopyButton = ({ text }) => {
    const [isClicked, setIsClicked] = useState(false);

    const writeToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    setIsClicked(true);
                    setTimeout(() => {
                        setIsClicked(false);
                    }, 2000);
                })
                .catch(() => {
                    setIsClicked(false);
                });
        }
    };

    return (
        <span className='copy-button'>
            <img
                className={`i-icon ${isClicked ? 'clicked' : ''}`}
                src={copyIcon}
                alt="Icon"
                onClick={() => writeToClipboard(text)}
            />
            {isClicked && <span className="success-text">{text}</span>}
        </span>
    );
};


import PropTypes from "prop-types";
CopyButton.propTypes = {
    text: PropTypes.string.isRequired,
};
export default CopyButton;
