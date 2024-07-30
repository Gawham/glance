import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { RiRefreshLine } from '@remixicon/react';
import { Button } from '@tremor/react';

interface TextInputHeroProps {
  onSubmit: (firmName: string) => void;
  width?: string;  // Add width as an optional prop
  height?: string; // Add height as an optional prop
}

export function TextInputHero({ onSubmit, width = '100%', height = 'auto' }: TextInputHeroProps) {
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
    <div className="flex justify-center items-center w-full" style={{ height }}>
      <div className="relative" style={{ width }}>
        <input
          type="text"
          placeholder="Please Enter Company Name"
          className="p-2 border rounded-md w-full pr-10"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={{ height: '100%' }}  // Adjust the input height to fill the container
        />
        <Button
          className="absolute right-0 top-0 h-full bg-black text-white hover:bg-gray-800 border border-black rounded-none"
          style={{ borderColor: 'black', height: '100%' }}
          onClick={handleEnterClick}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
