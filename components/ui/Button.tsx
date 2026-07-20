'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'success';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {

  // Base classes for the button, enforcing the 200x40px size
  const baseClasses = 'w-[200px] h-[40px] rounded-full text-[11px] font-bold flex items-center justify-center transition-colors shadow-sm shrink-0 whitespace-nowrap';

  // Variant-specific classes
  const variants = {
    primary: 'bg-[#022C4F] text-white hover:bg-[#033A6B]',
    outline: 'border border-[#022C4F] text-[#022C4F] bg-white hover:bg-gray-50',
    danger: 'bg-[#F23005] text-white hover:bg-[#D92A04]',
    success: 'bg-[#8BC34A] text-white hover:bg-[#7CB342]',
  };

  // Disabled state classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${disabled ? disabledClasses : ''} 
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
