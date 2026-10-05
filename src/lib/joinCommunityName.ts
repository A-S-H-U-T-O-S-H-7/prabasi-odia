export const ENGLISH_NAME_PATTERN = /^[A-Za-z ]+$/;

export const keepEnglishNameCharacters = (value: string) => value.replace(/[^A-Za-z ]/g, '');
