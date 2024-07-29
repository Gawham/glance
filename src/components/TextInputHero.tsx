import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { RiRefreshLine } from '@remixicon/react';
import { Button } from '@tremor/react';

interface TextInputHeroProps {
  onSubmit: (firmName: string) => void;
}

export function TextInputHero({ onSubmit }: TextInputHeroProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleEnterClick = () => {
    if (inputValue.trim() !== '') {
      setLoading(true);
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEnterClick();
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 w-full">
      <input
        type="text"
        placeholder="Please Enter Company Name"
        className="flex-1 p-2 border rounded-md w-3/4"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
      />
      <Button 
        icon={RiRefreshLine} 
        className="bg-black text-white hover:bg-gray-800 border border-black"
        style={{ borderColor: 'black' }}
        onClick={handleEnterClick}
      >
        Enter
      </Button>
    </div>
  );
}
