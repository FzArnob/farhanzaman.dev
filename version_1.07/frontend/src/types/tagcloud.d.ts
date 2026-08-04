declare module 'TagCloud' {
  interface TagCloudOptions {
    radius?: number;
    maxSpeed?: 'slow' | 'normal' | 'fast';
    initSpeed?: 'slow' | 'normal' | 'fast';
    direction?: number;
    keep?: boolean;
    useContainerInlineStyles?: boolean;
    useItemInlineStyles?: boolean;
  }
  function TagCloud(selector: string, texts: string[], options?: TagCloudOptions): void;
  export default TagCloud;
}
