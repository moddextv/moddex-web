const splitArray = (array, chunkSize) => {
  const results = [];
  while (array.length) {
    results.push(array.splice(0, chunkSize));
  }
  return results;
};

const gqlQuery = async (body) => {
  try {
    return fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US',
        'Client-Version': '7f3e84e3-9bb1-4c29-aab5-c83c4a3f8995',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        'Referer': 'https://www.twitch.tv/',
        'Client-ID': 'ue6666qo983tsx6so1t0vnawi233wa',
        'Content-Type': 'application/json'
      },
      body
    }).then(res => res.json());
  } catch (e) {
    console.error('Error fetching data:', e);
    return [];
  }
};

const fetchUsers = async (userIds) => {
  const chunkedUserIds = splitArray(userIds, 50);

  const users = await Promise.all(chunkedUserIds.map(async chunk => {
    const operations = chunk.map(id => `
      user_${id}: user(id: "${id}") {
        createdAt
        id
        login
        displayName
        description
        profileImageURL(width: 150)
        followers(first: 25) {
          totalCount
        }
      }
    `).join('\n');

    const response = await gqlQuery(JSON.stringify({
      query: `query { ${operations} }`
    }));

    if (!response?.data) return [];

    return Object.values(response.data).map((user) => {
      if (!user) return false;

      return {
        id: user.id,
        login: user.login,
        name: user.displayName,
        avatar: user.profileImageURL,
        bio: user.description,
        follower: user.followers?.totalCount || 0,
        badges: []
      };
    });
  }));

  return users.flat();
}

const users = [
  '13731254',
  '401235515',
  '676966284',
  1000000230,
  1000000960,
  1000001147,
  1000002041,
  100000350,
  1000004832,
  1000005668,
  1000006542,
  1000007375,
  1000009210,
  100000934,
  1000009768,
  1000009844,
  1000011236,
  100001367,
  100001431,
  1000015294,
  100001559,
  1000016854,
  1000020168,
  1000021283,
  1000021299,
  1000022735,
  1000026108,
  1000027529,
  1000031447,
  1000032371,
  1000032894,
  1000039917,
  1000039972,
  100004160,
  100004176,
  1000043650,
  1000047930,
  100005057,
  100005351,
  1000054566,
  1000054926,
  100005562,
  100005604,
  1000057139,
  1000059440,
  1000059553,
  1000063807,
  1000064687,
  100006859,
  1000068807,
  1000069015,
  1000070109,
  1000070177,
  100007101,
  1000071481,
  1000071579,
  1000072601,
  1000072854,
  1000073550,
  1000074143,
  1000075730,
  1000077605,
  1000077843,
  100008377,
  1000092776,
  1000093239,
  1000093243,
  1000094991,
  1000097714,
  1000098368,
  1000101153,
  1000101450,
  1000104087,
  1000105084,
  1000105465,
  100010643,
  100010692,
  1000108451,
  1000109626,
  1000113214,
  1000114602,
  1000115597,
  100011688,
  1000117503,
  1000118826,
  1000118937,
  100011992,
  1000120093,
  1000120236,
  1000120286,
  1000121017,
  1000121928,
  1000122289,
  1000122944,
  1000125695,
  1000128836,
  1000130743,
  1000130983,
  100013126,
  1000133608,
  100013435
]

fetchUsers(users).then(user => {
  console.log(user.length);
})