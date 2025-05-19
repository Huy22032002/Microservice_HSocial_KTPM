export const BANNED_WORDS = [
  "mẹ","chó","thằng","ngu","điên","đồ","khốn","bệnh","câm","đần"
];

export const containsBannedWords = (text) => {
  if (!text) return { hasBannedWords: false, bannedWordsFound: [] };
  
  const lowerText = text.toLowerCase();
  const foundWords = BANNED_WORDS.filter(word => 
    lowerText.includes(word.toLowerCase())
  );
  
  return {
    hasBannedWords: foundWords.length > 0,
    bannedWordsFound: foundWords
  };
};