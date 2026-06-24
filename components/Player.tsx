import React from "react";

type Props = {
  src?: string;
  muted?: boolean;
};

export default function Player({ src, muted }: Props) {
  return (
    <div className="w-full">
      <video src={src} controls muted={!!muted} className="w-full" />
    </div>
  );
}
