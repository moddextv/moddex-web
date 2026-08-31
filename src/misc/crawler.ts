// applebot, gptbot and googlebot all say bot; meta and facebook say neither
const CRAWLER = /bot\b|crawler|spider|slurp|externalagent|externalhit/i;

export const isCrawler = (userAgent: string): boolean => CRAWLER.test(userAgent);
