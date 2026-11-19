// links.js — the puzzle "link graph".
// Each entry "A B" means A+B is a real compound word (e.g. FIRE+WORK = FIREWORK)
// or a very common two-word phrase (e.g. TIME OFF). Daily and unlimited chains are
// random walks through this graph, so EVERY adjacent pair in a chain is valid.
// Rules for adding entries: lowercase, single words, 3-8 letters each, family-friendly,
// no brand names, and the pair must be something an average US/UK adult knows.
export const LINK_TEXT = `
air bag|air line|air port|air plane|air craft|air mail|air lock|air show|air time|air way
back bone|back door|back yard|back pack|back fire|back hand|back ground|back stage|back side|back up|back road|back seat|back light
ball game|ball park|ball room|ball point
band stand|band wagon|band width
bath room|bath tub|bath robe|bath time
bed room|bed time|bed side|bed rock|bed bug|bed spread
bird house|bird song|bird cage|bird seed|bird bath|bird watch
black board|black bird|black smith|black list|black out|black hole|black jack|black mail|black tie|black belt
blue bird|blue berry|blue print|blue moon|blue cheese|blue grass|blue tooth
board game|board room|board walk
boat house|boat yard
book case|book shelf|book mark|book worm|book store|book end|book keeper|book club
bow tie
brain storm|brain wave|brain child
bread box|bread crumb|bread board|bread stick
break fast|break down|break up|break point|break time|break water|break out
brick wall|brick work|brick layer
bus stop|bus station|bus ride|bus driver
butter fly|butter milk|butter cup|butter nut|butter knife
cake walk|cake stand
camp fire|camp site|camp ground
candle light|candle stick|candle wax
car park|car pool|car wash|car seat|car port|car door
card board|card game|card table|card shark
cat fish|cat walk|cat nap|cat call
cheese cake|cheese board|cheese burger
chop stick|chop shop
clock work|clock tower|clock face
coat hook|coat rack|coat tail
coffee cup|coffee table|coffee shop|coffee break|coffee pot|coffee bean
cook book|cook out|cook ware
corn bread|corn field|corn flake|corn starch|corn dog|corn row
cow boy|cow bell|cow girl|cow hand
cream cheese|cream puff
cross word|cross road|cross walk|cross fire|cross bow|cross over
cup cake|cup board
day light|day dream|day break|day time|day off|day job|day trip|day care
dead line|dead lock|dead end|dead wood
dish washer|dish cloth|dish rack
dog house|dog bone|dog sled|dog tag|dog food
door bell|door step|door way|door mat|door knob|door man|door stop
down town|down hill|down pour|down load|down side|down stairs|down fall|down time
dream land|dream boat|dream team|dream world
drum stick|drum beat|drum roll
ear ring|ear phone|ear plug|ear lobe|ear mark|ear wax
egg shell|egg plant|egg cup|egg roll|egg timer
eye ball|eye brow|eye lash|eye lid|eye sight|eye witness|eye drop
face book|face mask|face time|face lift|face value
farm house|farm land|farm yard
finger nail|finger print|finger tip
fire place|fire work|fire man|fire fly|fire wood|fire truck|fire alarm|fire side|fire proof|fire ball|fire drill|fire wall
fish bowl|fish cake|fish net|fish tank|fish hook|fish bone
flash light|flash back|flash card|flash point
flower pot|flower bed|flower shop
foot ball|foot print|foot note|foot step|foot path|foot hold|foot work|foot stool
fruit cake|fruit fly|fruit bowl
game room|game show|game plan|game time|game day
gold fish|gold mine|gold smith|gold medal
grand stand|grand father|grand mother|grand child|grand piano|grand slam
grass land|grass hopper|grass roots
green house|green land|green light|green room|green tea
ground work|ground hog|ground floor|ground rule
hair cut|hair brush|hair pin|hair line|hair dryer|hair band|hair style
hand bag|hand shake|hand book|hand made|hand rail|hand writing|hand ball|hand cuff|hand stand|hand out|hand over
head line|head band|head light|head phone|head room|head stone|head start|head ache|head master|head lock
heart beat|heart break|heart land
high way|high light|high land|high chair|high school|high time
home work|home town|home made|home land|home run|home page|home sick
honey bee|honey moon|honey comb|honey pot
horse shoe|horse power|horse play|horse back
hot dog|hot cake|hot spot|hot line|hot shot|hot tub|hot pot
house boat|house work|house hold|house plant|house fly|house party|house keeper
ice cream|ice berg|ice cube|ice cap|ice box|ice skate|ice pack
ink well|ink pot
jelly fish|jelly bean
key board|key hole|key note|key chain|key stone|key ring
lady bug|lady bird
land mark|land lord|land slide|land fill|land line
lap top|lap dog
law suit|law maker
life guard|life time|life style|life boat|life line|life jacket
light house|light bulb|light weight|light year|light switch|light show
lime light|lime stone
line up|line man|line dance
lip stick|lip balm|lip read
lock smith|lock down|lock box
look out|look up
mail box|mail man|mail room
main land|main stream|main frame
match box|match point|match stick|match up
milk shake|milk man|milk tooth
moon light|moon beam|moon shine|moon walk
mouse trap|mouse pad|mouse hole
mouth wash|mouth piece
news paper|news room|news letter|news flash
night fall|night time|night club|night mare|night shift|night light|night owl|night gown
note book|note pad|note card
out side|out door|out line|out fit|out come|out back|out put|out law|out run|out post
over time|over coat|over board|over head|over look|over night|over flow|over pass
paper back|paper work|paper weight|paper clip|paper plate|paper boy
pass word|pass port|pass book
pea nut|pea cock|pea pod
pen knife|pen pal
pine apple|pine cone|pine tree
play ground|play time|play house|play mate|play book|play room|play date|play pen|play list
pop corn|pop star|pop quiz|pop art
post card|post man|post office|post box|post mark
pot hole|pot luck|pot roast
rain bow|rain coat|rain drop|rain fall|rain storm|rain forest|rain check|rain cloud
red wood|red head|red light|red carpet|red tape
road map|road side|road block|road trip|road work
rock star|rock salt|rock band
room mate|room service
round table|round trip|round about
run way|run down|run time
sand box|sand castle|sand paper|sand storm|sand bag
school bag|school house|school yard|school bus|school book|school work
sea food|sea horse|sea shell|sea side|sea weed|sea gull|sea port
shoe lace|shoe box|shoe horn|shoe shop
shop keeper|shop front|shop floor
side walk|side kick|side line|side show|side step|side car|side board
sky line|sky light|sky scraper|sky diver
snow ball|snow man|snow flake|snow fall|snow storm|snow board|snow plow|snow shoe|snow day
soap box|soap opera
space ship|space suit|space bar|space walk
spot light|spot check
star fish|star light|star dust|star gazer
step ladder|step mother|step father|step child
stone wall|stone work|stone age
story book|story line|story board|story teller
straw berry|straw hat
sun flower|sun light|sun rise|sun set|sun burn|sun day|sun shine|sun glasses|sun screen|sun dial|sun spot
super market|super star|super man|super hero
table cloth|table spoon|table top|table tennis
tea cup|tea pot|tea spoon|tea time|tea bag|tea party|tea room
team mate|team work|team spirit
tear drop
time line|time table|time zone|time out|time off|time piece|time keeper
tooth brush|tooth paste|tooth pick|tooth ache
top hat|top soil|top coat|top floor
town house|town hall|town ship
tree house|tree top|tree line
up stairs|up town|up hill|up date|up beat|up side|up load|up grade|up root
wall paper|wall flower|wall clock
wash room|wash cloth|wash basin
watch dog|watch man|watch tower|watch word
water fall|water melon|water proof|water slide|water front|water mark|water bottle|water color|water way|water park|water table|water fall
way side|way point
weather man|weather vane
week day|week end|week night
wheel chair|wheel house|wheel barrow
white board|white wash|white house|white collar|white paper|white water|white noise
wind mill|wind shield|wind fall|wind pipe|wind chime|wind storm|wind sock|wind surf
wood work|wood land|wood pecker|wood shed|wood pile|wood stove
word play|word search|word game|word list
work shop|work out|work place|work book|work day|work force|work load|work man|work room|work bench
world wide|world map|world class
yard stick|yard sale|yard work

case work|mark down|point blank|box office|box car|stick man|pin ball|pin point|brush fire|fly paper|fly wheel
cut back|trip wire|wire tap|tap dance|dance floor|floor plan|floor board|show case|show room|show time|show boat
cap stone|salt water|plant pot|hole punch|punch line|party line|hold up|bench mark|bell boy|boy friend|friend ship
ship yard|ship wreck|stick up|bag pipe|pipe line|pipe dream|force field|field trip|field work|nut shell|shell fish
chair man|man hole|man kind|bone dry|dry clean|clean up|tail gate|gate way|gate house|net work|net ball|fly ball
print out|wave length|cloud burst|storm drain|drain pipe|drop out|drop kick|kick off|kick back|off side|off shore
shore line|pack horse|horse fly|brow beat|beat box|shake up|shake down|bean bag|walk way|walk out|screen play
screen saver|glass house|set back|set up|burn out|spoon feed|feed back|proof read|slide show|front line
bottle neck|neck tie|neck lace|color blind|blind fold|fold out|park way|park land|wash out|end game|end zone
worm hole|store room|store front|front door|club house|nail polish|tip toe|toe nail|path way|mine field
slam dunk|child hood|rule book|powder room|cut out|cuff link|stand by|by pass|by way|by line|master piece
piece meal|meal time|start up|power house|power plant|power line|power point|bean stalk|suit case|guard rail
rail way|rail road|year book|switch board|switch back|stream line|frame work|trap door|pad lock|letter box
letter head|come back|come down|flow chart|port hole|cock pit|pit stop|stop watch|stop light|cast iron|iron man
iron work|apple pie|pie chart|date line|art work|fall out|check point|check list|check mate|check out|check up
tape measure|block buster|block head|about face|food chain|chain saw|chain mail|saw dust|dust pan|pan cake
opera house|bar code|bar tender|mother land|mother board|market place|place mat|pick up|pick pocket
pocket book|pocket knife|pocket money|hall way|hall mark|root beer|mill stone|mill pond|surf board|stove pipe
search light|class room|class mate|cup board|plate glass|glass work|guide book|guide line|fruit tree

tie break|tie dye|tie pin|seat belt|bug spray|wax paper|wax work|tower block|hook up|hill side|hill top
roll call|roll over|roll back|ring side|ring tone|ring leader|ring master|phone book|phone call|phone line
father hood|weight room|weight loss|read out|office work|office block|office party|map maker|hat trick|hat box|hat stand
craft room|stage coach|stage hand|stage fright|wagon wheel|song bird|song book|song writer|seed bed|jack pot|jack knife|jack rabbit
shelf life|fast food|fast lane|fast track|fast ball|station wagon|site map|pool table|pool side|pool party|call back|call box
row boat|row house|girl friend|girl hood|care free|care taker|sled dog|tag line|sight line|witness box|witness stand|lift off
truck stop|truck driver|alarm clock|tank top|piano bar|hog wash|page boy|bee hive|bee line|shot glass|skate park|clip board
pod cast|quiz show|quiz master|forest fire|service station|service area|dial tone|tennis ball|tennis court|grade school
collar bone|pile up|blank space|code word|code name|code book|money box|money bag|beer garden|pond life
court room|court yard|court house|life span|food court|cast away|coach house|hand stand|book stand|fire place
`;

// ---- derived structures (pure, shared by browser + Node build/tests) ----
export function parseLinks(text = LINK_TEXT) {
  const pairs = [];
  const seen = new Set();
  for (const raw of text.split(/[|\n]/)) {
    const p = raw.trim().toLowerCase();
    if (!p) continue;
    const [a, b, extra] = p.split(/\s+/);
    if (!a || !b || extra) throw new Error(`Bad link entry: "${raw}"`);
    const key = a + ' ' + b;
    if (seen.has(key)) continue; // tolerate accidental duplicates
    seen.add(key);
    pairs.push([a, b]);
  }
  return pairs;
}

export function buildGraph(pairs = parseLinks()) {
  const next = new Map(); // word -> Set(words that can follow)
  const edge = new Set();
  for (const [a, b] of pairs) {
    if (!next.has(a)) next.set(a, new Set());
    next.get(a).add(b);
    edge.add(a + ' ' + b);
  }
  return { next, edge, has: (a, b) => edge.has(a + ' ' + b) };
}
