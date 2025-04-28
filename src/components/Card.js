import React from 'react';

const Card = ({ title, code }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            alert(`${title} code copied to clipboard!`);
        });
    };

    return (
        <div className="card" onClick={handleCopy}>
            <h3>{title}</h3>
            <pre>{code}</pre>
        </div>
    );
};

export default Card;