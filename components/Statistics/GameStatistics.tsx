import { useEffect } from "react";

const GameStatistics = ({ handleReset }: { handleReset(): void}) => {
    
    return (
        <>
            <div className="letter incorrect">
                Game over stats
                <button onClick={() => handleReset()}>Reset</button>
            </div>
        </>
    )
}


export default GameStatistics;