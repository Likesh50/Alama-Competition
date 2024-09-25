import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width:400px;
`;

const Word = styled.span`
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  color: #708090;
  
  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  &.highlight-abacus {
    color: #dd5914;
    font-weight: bold;
  }
  
  &.highlight-alama {
    color: #4f1660;
    font-weight: italic;
  }
`;

const AppearText = ({ delayBetweenWords = 300 }) => {
  const [currentWord, setCurrentWord] = useState(-1);
  const words = ["Empowering", "young", "minds", "with", "ALAMA", "Abacus"];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentWord < words.length - 1) {
        setCurrentWord(currentWord + 1);
      }
    }, delayBetweenWords);

    return () => clearTimeout(timer);
  }, [currentWord, delayBetweenWords]);

  return (
    <TextContainer>
      {words.map((word, index) => (
        <Word
          key={index}
          className={`${index <= currentWord ? 'visible' : ''} 
                      ${word === "Abacus" ? 'highlight-abacus' : ''} 
                      ${word === "ALAMA" ? 'highlight-alama' : ''}`}
        >
          {word}
        </Word>
      ))}
    </TextContainer>
  );
};

export default AppearText;
