
const GameStatistics = ({ handleReset, wordsPerMinute, accuracy, time }
    : { handleReset(): void, wordsPerMinute: number, accuracy: number, time: number}) => {
    
    return (
        <>
            <div className='result-wrapper'>
                <div className='result wpm'>
                    {wordsPerMinute}
                    <p>WPM</p>
                </div>
                <div className='result accuracy'>
                    {accuracy}
                    <p>Accuracy</p>
                </div>
                <div className='result duration'>
                    {time}
                    <p>Duration</p>
                </div>
                
            </div>
            <a className='reset-btn' onClick={() => handleReset()}>Try again</a>
        </>
    )
}


export default GameStatistics;