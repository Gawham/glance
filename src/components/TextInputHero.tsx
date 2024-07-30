// /components/TextInputHero.tsx
import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Button } from '@tremor/react';
import { useLoading } from '@/context/LoadingContext';

interface TextInputHeroProps {
  onSubmit: (firmName: string) => void;
  width?: string;
  height?: string;
}

export function TextInputHero({ onSubmit, width = '100%', height = 'auto' }: TextInputHeroProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const { loading, setLoading, disableAfterLoading } = useLoading();

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
          style={{ height: '100%' }}
          disabled={loading || disableAfterLoading}
        />
        <Button
          className="absolute right-0 top-0 h-full bg-black text-white hover:bg-gray-800 border border-black rounded-none"
          style={{ borderColor: 'black', height: '100%' }}
          onClick={handleEnterClick}
          disabled={loading || disableAfterLoading}
        >
          Enter
        </Button>
      </div>
    </div>
  );
}
