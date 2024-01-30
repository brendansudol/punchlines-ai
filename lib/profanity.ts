import profanity from 'leo-profanity';

// making the profanity filter slightly less strict
// (this is admittedly a ridiculous file, my apologies)
profanity.remove([
  'ass',
  'bastard',
  'bullshit',
  'butt',
  'genitals',
  'nude',
  'nudity',
  'orgasm',
  'penis',
  'sex',
  'sexy',
  'swinger',
  'vagina'
]);

export { profanity };
