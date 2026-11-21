import React from 'react';

function SkChat() {
  return [1, 2, 3, 4, 5].map((i) => (
    <div className="flex space-x-2 pt-5" key={i}>
      <div className="shadow-md size-12 shrink-0 rounded-full bg-text/10" />
      <div className="flex flex-col w-full space-y-1 justify-center">
        <div className="flex justify-between h-[1.125rem]">
          <p className="bg-text/10  w-full rounded-md" />
          <p className="bg-text/10 py-2 min-w-[4rem] rounded-md ml-[2%]" />
        </div>
        <div className="flex justify-between h-[1.125rem] space-x-28">
          <p className="w-full bg-text/10 py-2 rounded-md" />
          <p className=" bg-text/10 w-5 rounded-full" />
        </div>
      </div>
    </div>
  ));
}

function SkChatHeader() {
  return (
    <div className="py-10 h-12 flex items-center justify-between">
      <div className="flex space-x-2 ">
        <div className="w-12 h-12 rounded-full bg-text/10" />
        <div className="h-full space-y-2">
          <p className="bg-text/10 h-4 w-[5.32rem]   rounded-md" />
          <p className="bg-text/10 h-4 w-12  rounded-md" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-4 h-4 bg-text/10 rounded-md" />
        <div className="w-3 h-3 bg-text/10 rounded-md">
          <div className="bg-text/10 w-1 h-1 ml-3 py-1 mt-1" />
        </div>
      </div>
    </div>
  );
}

export { SkChat, SkChatHeader };
