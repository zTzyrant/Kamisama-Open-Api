import { filterXSS } from 'xss';

export const sanitizeEditorJsContent = (content: any): any => {
    if (!content || typeof content !== 'object') {
        return content;
    }

    // Deep clone the content to avoid modifying the original object
    const sanitizedContent = JSON.parse(JSON.stringify(content));

    if (Array.isArray(sanitizedContent.blocks)) {
        sanitizedContent.blocks.forEach((block: any) => {
            if (block.data && typeof block.data.text === 'string') {
                block.data.text = filterXSS(block.data.text);
            }
            // Handle other block types and their text-like properties
            if (block.type === 'list' && Array.isArray(block.data.items)) {
                block.data.items.forEach((item: any) => {
                    if (typeof item.content === 'string') {
                        item.content = filterXSS(item.content);
                    }
                });
            }
            if (block.type === 'quote' && typeof block.data.text === 'string') {
                block.data.text = filterXSS(block.data.text);
                if (typeof block.data.caption === 'string') {
                    block.data.caption = filterXSS(block.data.caption);
                }
            }
            if (block.type === 'code' && typeof block.data.code === 'string') {
                block.data.code = filterXSS(block.data.code);
            }
            if (block.type === 'table' && Array.isArray(block.data.content)) {
                block.data.content.forEach((row: any) => {
                    if (Array.isArray(row)) {
                        row.forEach((cell: any, index: number) => {
                            if (typeof cell === 'string') {
                                row[index] = filterXSS(cell);
                            }
                        });
                    }
                });
            }
            if (block.type === 'warning' && typeof block.data.message === 'string') {
                block.data.message = filterXSS(block.data.message);
                if (typeof block.data.title === 'string') {
                    block.data.title = filterXSS(block.data.title);
                }
            }
            if (block.type === 'alert' && typeof block.data.message === 'string') {
                block.data.message = filterXSS(block.data.message);
            }
            if (block.type === 'image' && typeof block.data.caption === 'string') {
                block.data.caption = filterXSS(block.data.caption);
            }
            // Add more block types as needed
        });
    }

    return sanitizedContent;
};