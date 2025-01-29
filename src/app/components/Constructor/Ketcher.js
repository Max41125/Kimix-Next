"use client";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import { Editor } from "ketcher-react";
import "ketcher-react/dist/index.css";

const structServiceProvider = new StandaloneStructServiceProvider();

export default function KetcherEditorReact() {
  return (
    <div className="container mx-auto p-4 h-[80vh] flex flex-col"> 
    <Editor
      staticResourcesUrl=""
      structServiceProvider={structServiceProvider}
      errorHandler={(err) => console.log(err)}
    />
    </div>
  );
}