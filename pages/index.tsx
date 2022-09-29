import type { NextPage } from 'next'
import { stringify } from 'querystring';
import { useState, useEffect, useRef } from 'react';
import GameStatistics from '../components/Statistics/GameStatistics';
import data from '../static/quotes.json';
import classNames from 'classnames';


const Home: NextPage = () => {
    
    const [userInput, setUserInput] = useState('');
    const [quote, setQuote] = useState({text: '', length: 0});
    const [isGameOver, setIsGameOver] = useState(false);
    const [inputHasFocus, setInputHasFocus] = useState(true);
    const [timerStart, setTimerStart] = useState(0);
    const [totalMistakes, setTotalMistakes] = useState(0);
    const [result, setResult] = useState({wpm: 0, accuracy: 0, duration: 0})

    // only on startup
    // useEffect(() => {
    //     return () => {
    //         console.log('only startup')
    //         pullQuote();
    //     }
    // }, [])

    const usePrevious = (value: any) => {
        const ref = useRef();
        useEffect(() => {
          ref.current = value;
        });
        return ref.current;
      }

    // need to test
    // i dont want to pull a quote when the game ends only when page loads and when a new game is started
    const previousIsGameOverState = usePrevious(isGameOver);

    useEffect(() => {
        pullQuote()
        setUserInput('');
        setFocusToInput();
    }, [isGameOver])

    // wait till the quote is pulled and then calculate cursor position
    useEffect(() => {
        calculateCursorPosition();
    }, [quote])

    //calculate cursor position on window resize
    useEffect(() => {
        const handleResize = () => {
          calculateCursorPosition();
        }

        window.addEventListener('resize', handleResize)
    }, []);

    const pullQuote = () => {
        const numOfElements = data.quotes.length;
        const randomNum = Math.floor(Math.random() * (numOfElements - 1) + 1);
        const quote = data.quotes[randomNum];
        const numOfWords = quote.text.split(' ');
        
        setQuote({ 
            text: quote.text,
            length: numOfWords.length
        });
    }

    const renderWords = ()  => {
        let wordArray = quote.text.split(' ');
       
        const mappedItem = wordArray.map((word, i) => {
            const letters: string[] = word.split('');
            return (
                <div key={i} className={i == 0 ? 'word active' : 'word'} >
                    { letters.map((letter, j) => 
                        (
                            <div key={j} className='letter'>{letter}</div>
                        ))
                    }
                </div>
                );
            }
        );

        return mappedItem
    }

    const getActiveWordElement = (): HTMLElement | null => {
        const activeWordElements: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('word active') as HTMLCollectionOf<HTMLElement>

        if (activeWordElements.length == 1) {
            return activeWordElements[0];
        }

        return null;
    }

    const setActiveWord = (): void => {
        const words = document.getElementsByClassName('word');
        const wordElements = Array.from(words).filter(el => el.className == 'word');

        if (wordElements.length > 0) {
            const firstWord = wordElements[0];
            firstWord.classList.add('active');
        }
    }

    const isActiveWordValid = (): boolean => {
        const activeWordElement: HTMLElement | null = getActiveWordElement();

        if (!activeWordElement) return false;

        const invalidLettersList: Element[] = Array.from(activeWordElement.children)
                                                .filter(element => !element.classList.contains('correct'));

        if (invalidLettersList.length > 0) {
            return false;
        }

        return true;
    }

    const setActiveWordToSuccess = (): void => {
        const activeWordElement: HTMLElement | null = getActiveWordElement();
        activeWordElement?.classList.replace('active', 'success');
    } 

    const validateLetter = (element: any): void => {
        const activeWordElement = getActiveWordElement();
        
        if (!activeWordElement) return;

        const letters = activeWordElement.children;
        const hasExtraLetters = Array.from(letters).filter(x => x.classList.contains('extra'));
        const input: string = element.target.value
        const inputLength: number = input.length;

        if (inputLength <= letters.length && hasExtraLetters.length == 0) {
            if (inputLength > 0) {
                const index = inputLength - 1;
                const selectedLetter = letters[index];
                if (input[index] == selectedLetter.innerHTML) {
                    selectedLetter.classList.add('correct');
                    // check if last letter of the word
                    const remainingLettersList = Array.from(activeWordElement.children).filter(x => x.className == 'letter');
                    if (remainingLettersList.length == 0) {
                        const allWords = document.getElementsByClassName('text-container')[0].children;
                        const remaningWords = Array.from(allWords).filter(x => x.className == 'word')

                        // if last word and last letter then end game
                        if (remaningWords.length == 0) {
                            endTest();
                        }
                    }
                } else {
                    selectedLetter.classList.add('incorrect');
                    setTotalMistakes(totalMistakes + 1);
                }
            }

            const validatedLettersList: Element[] = Array.from(activeWordElement.children)
                            .filter(element => element.classList.contains('correct') 
                                            || element.classList.contains('incorrect'));
            // backspace detected
            if (validatedLettersList.length > 0 && inputLength != validatedLettersList.length) {
                validatedLettersList[validatedLettersList.length - 1].classList.remove('correct');
                validatedLettersList[validatedLettersList.length - 1].classList.remove('incorrect');
            }
        } else {
            const allLetterElements = activeWordElement.children;
            if (inputLength <= allLetterElements.length) {
                const extraLetterElements = Array.from(allLetterElements).filter(x => x.classList.contains('extra'));
    
                if (extraLetterElements.length == 1) {
                    const lastElement = extraLetterElements[0];
                    activeWordElement.removeChild(lastElement);
                }
                
                if (extraLetterElements.length > 1) {
                    const lastElement = extraLetterElements[extraLetterElements.length - 1];
                    activeWordElement.removeChild(lastElement);
                }
            } else {
                const htmlElement = document.createElement('div')
                htmlElement.innerHTML = input[input.length - 1].replace(' ', '&nbsp;');
                htmlElement.classList.add('letter')
                htmlElement.classList.add('incorrect')
                htmlElement.classList.add('extra')
                activeWordElement.appendChild(htmlElement);
            }
        }
    }

    const calculateCursorPosition = (): void => {
        const activewordElement = getActiveWordElement();
        
        if (activewordElement) {
            const activeWordDom: DOMRect = activewordElement.getBoundingClientRect();
            const cursorElement: HTMLElement | null = document.getElementById('cursor');

            if (cursorElement != null) {
                const validatedLettersList: Element[] = Array.from(activewordElement.children)
                            .filter(element => element.classList.contains('correct') 
                                            || element.classList.contains('incorrect'));

                let pixels: number = 0;
                const topPixels: number = activeWordDom.top;
                if (validatedLettersList.length > 0) {
                    for (let i = 0; i < validatedLettersList.length; i++) {
                        pixels = pixels + validatedLettersList[i].getBoundingClientRect().width;
                    }
                }

                cursorElement.style.left = activeWordDom.left + pixels + 'px';
                cursorElement.style.top = topPixels + 'px';
            }
        }
    };

    const handleInput = (e: any): void => {
        if (timerStart == 0) {
            startTimer();
        }
        // space detected
        if (e.nativeEvent.data == ' ') {
            if (isActiveWordValid()) {
                submitWord();
            }
            else {
                setUserInput(e.target.value);
                validateLetter(e);
            }
        } else {
            setUserInput(e.target.value);
            validateLetter(e);
        }

        calculateCursorPosition();
    }

    const submitWord = (): void => {
        setUserInput('');
        setActiveWordToSuccess();
        setActiveWord();
    }

    const setFocusToInput = (): void => {
        const inputElement = document.getElementById('input');
        inputElement?.focus();
    }

    const startTimer = (): void => {
        setTimerStart(new Date().getTime())
        console.log('Started timer')
    }

    const getElapsedTime = (): number => {
        let elapsedTime = new Date().getTime() - timerStart;
        return elapsedTime / 1000;
    }

    const calculateWordsPerMinute = (durationInSeconds: number, numOfWords: number): number => {
        return Math.round(numOfWords / (durationInSeconds / 60));
    }

    const calculateAccuracy = () => {
        const totalCharacters = quote.text.replace(' ', '').length;
        if (totalMistakes == 0) {
            return 100;
        }
        const accuracy = 100 - (totalMistakes * 100) / totalCharacters;
        return Math.floor(accuracy);
    }

    const endTest = () => {
        const duration = getElapsedTime();
        setResult({
            wpm: calculateWordsPerMinute(duration, quote.length),
            accuracy: calculateAccuracy(),
            duration: duration
        });

        setIsGameOver(true);
    }

    const resetTest = (): void => {
        setIsGameOver(false);
        setTimerStart(0);
    }

    return (
        <div className='wrapper'>
            {!isGameOver ? 
                <>
                    <div>
                        <input id='input' 
                               value={userInput} 
                               autoComplete='off'
                               onChange={e => handleInput(e)}
                               onBlur={() => setInputHasFocus(false)}
                               onFocus={() => setInputHasFocus(true)} />
                    </div>
                    <div className={classNames('text-container', {'blur': !inputHasFocus})} onClick={setFocusToInput}>
                        
                        { renderWords()}
                    </div>
                    <div id='cursor' className='cursor'></div>
                    { !inputHasFocus &&
                        <div className='direct-focus'>Click here to set focus!</div>
                    }
                    
                </>
                :
                <GameStatistics handleReset={() => resetTest()}
                                wordsPerMinute={result.wpm}
                                accuracy={result.accuracy}
                                time={result.duration} />
            }
        </div>
        
    )
}

export default Home
