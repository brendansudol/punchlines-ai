import shuffle from 'lodash.shuffle';

export const EXAMPLE_OPENING_LINES = [
  "A hacker has published Kim Kardashian's financial information online.",
  'A gambler won 14 million dollars on last night’s World Series game.',
  'The founder of IKEA has stepped down.',
  'A new high school in Chicago will be named after President Obama.',
  'The other day in Nevada, a woman ran into a Subway restaurant and gave birth.',
  'According to a new study, talking after having sex just as important as sex.',
  'Facebook announced major changes to its privacy settings.',
  'An exact replica of the Titanic is scheduled to set sail in 2018.',
  'Legendary astronaut Buzz Aldrin is now single.',
  'Safety experts now say more and more car crashes are being caused by GPS devices.',
  'Netflix is testing a new feature that will allow you to hide what you’ve been watching.',
  'A new survey shows two-thirds of American adults pee in the ocean.',
  'A Southwest pilot who famously landed at the wrong airport has retired.',
  'I had the craziest dream last night.',
  'Today is the Mexican holiday of Cinco de Mayo.',
  'For the first time ever, Cosmopolitan magazine is endorsing political candidates.',
  'The New York Times reports that General Electric did not pay any taxes at all last year.',
  'It’s been reported that "Wheel of Fortune" host Pat Sajak makes $12 million a year.',
  'Today, the FDA approved a new anti-obesity drug.',
  'A company has developed a vending machine that sells marijuana.',
  'A woman in Oregon awoke from dental surgery to find she had a British accent.',
  'An artificially intelligent sex robot is expected to hit the market next year.',
  'Safety experts now say more and more car crashes are being caused by GPS devices.',
  'An iPad used by the Pope is being auctioned off for charity.',
  'This week, a baby was pulled off a plane by the TSA for being a potential terrorist.',
  'New research suggests that people are attracted to voices that are similar to their own.',
  'On Friday, a man in Wisconsin broke a world record by eating his 30,000th Big Mac.',
  'This weekend in California, a man used a fake gun to rob a real gun store.',
  'Scientists have discovered the largest dinosaur ever - it weighed 65 tons and was a vegetarian.',
  'Scientists think they have definitive proof that Jesus had a wife.',
  'A new study found that toddlers who talk early tend to develop a drinking problem later on in life.',
  'Psychologists have found that going to sleep early may help ward off mental illness.',
  'Scientists at Yale taught monkeys to play a modified version of "Rock, Paper, Scissors."',
  '60% of Americans say they believe the nation is in a state of decline.',
  'It was 100 degrees today.',
  'New research suggests that the first human beings drank alcohol millions of years ago.',
  'An initiative has been proposed that would divide California into 6 separate states.',
  'The electronics company LG has designed a dishwasher that can send text messages to you.',
  'According to a new poll, Congress is less popular than head lice, Nickelback and Donald Trump.',
  'A kid in New Jersey is falsely claiming to be my illegitimate son.'
];

export function getRandomExamples(count: number = 4) {
  return shuffle(EXAMPLE_OPENING_LINES).slice(0, count);
}
