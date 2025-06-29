
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface FlashcardProps {
  question: string;
  answer: string;
  index: number;
}

interface FlashcardDeckProps {
  cards: { question: string; answer: string }[];
  deckTitle: string;
}

const Flashcard = ({ question, answer, index }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleSwipe = (dir: 'left' | 'right') => {
    setDirection(dir);
  };
  
  return (
    <motion.div 
      className="relative w-full max-w-lg mx-auto h-72 cursor-pointer"
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: direction ? 0 : 1,
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
        rotate: direction === 'left' ? -10 : direction === 'right' ? 10 : 0,
        scale: direction ? 0.8 : 1,
      }}
      transition={{ duration: 0.3 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) {
          handleSwipe('right');
        } else if (info.offset.x < -100) {
          handleSwipe('left');
        }
      }}
    >
      <motion.div 
        className={`absolute inset-0 rounded-xl shadow-lg flex flex-col justify-between p-6 ${isFlipped ? 'bg-white' : 'bg-medblue-50'}`}
        onClick={flipCard}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-right text-sm text-gray-500">Card {index + 1}</div>
        <div className={`text-xl font-medium text-center my-auto ${isFlipped ? 'transform rotate-180' : ''}`}>
          {isFlipped ? answer : question}
        </div>
        <div className={`text-xs text-gray-500 text-center ${isFlipped ? 'transform rotate-180' : ''}`}>
          {isFlipped ? "Answer" : "Click to flip"}
        </div>
      </motion.div>
    </motion.div>
  );
};

const FlashcardDeck = ({ cards, deckTitle }: FlashcardDeckProps) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<number[]>([]);
  const [activeCards, setActiveCards] = useState<number[]>([...Array(cards.length).keys()]);
  
  const handleCardComplete = (index: number, know: boolean) => {
    setCompletedCards([...completedCards, currentCardIndex]);
    
    const newActiveCards = activeCards.filter(i => i !== index);
    setActiveCards(newActiveCards);
    
    if (newActiveCards.length > 0) {
      setCurrentCardIndex(newActiveCards[0]);
    }
  };
  
  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{deckTitle}</h2>
        <p className="text-gray-600">
          {completedCards.length} of {cards.length} cards reviewed
        </p>
      </div>
      
      <div className="mb-8 relative h-80">
        <AnimatePresence>
          {activeCards.length > 0 ? (
            <Flashcard 
              key={`card-${currentCardIndex}`}
              question={cards[currentCardIndex].question}
              answer={cards[currentCardIndex].answer}
              index={currentCardIndex}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center p-12 rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <h3 className="text-xl font-medium text-gray-900 mb-2">Deck Complete!</h3>
              <p className="text-gray-600 mb-6">You've reviewed all cards in this deck</p>
              <Button onClick={() => {
                setActiveCards([...Array(cards.length).keys()]);
                setCompletedCards([]);
                setCurrentCardIndex(0);
              }}>
                Restart Deck
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {activeCards.length > 0 && (
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            size="lg"
            className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
            onClick={() => handleCardComplete(currentCardIndex, false)}
          >
            <XCircle className="w-5 h-5 mr-2" />
            <span>Repeat</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-green-200 text-green-600 hover:bg-green-50 flex-1"
            onClick={() => handleCardComplete(currentCardIndex, true)}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Know it</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
