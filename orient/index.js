var ODatabase = require('orientjs').ODatabase;
var db = new ODatabase({
    host: '433-21.csse.rose-hulman.edu',
    port: 2424,
    username: 'root',
    password: 'pheeN7wi',
    name: '433project'
});

async function recommendGames(userId) {
    return await _recommendGames(userId)
}

function _recommendGames(userId) {
    return db.query(
        `SELECT game, SUM(score) AS score FROM (SELECT score, id.out().name AS game FROM (SELECT EVAL('score - anti_score') AS score, id, name FROM
        (SELECT SUM(score) AS score, SUM(anti_score) AS anti_score, id, name FROM
        (SELECT EXPAND($union)
        LET $a = (SELECT COUNT(@rid) AS score, @rid AS id, name FROM (SELECT EXPAND(OUT('does_not_recommend').IN('does_not_recommend')) FROM User WHERE name = $userId ) WHERE name != $userId  GROUP BY @rid),
        $b = (SELECT COUNT(@rid) AS score, @rid AS id, name FROM (SELECT EXPAND(OUT('recommends').IN('recommends')) FROM User WHERE name = $userId ) WHERE name != $userId  GROUP BY @rid),
        $c = (SELECT COUNT(@rid) AS anti_score, @rid AS id, name FROM (SELECT EXPAND(OUT('does_not_recommend').IN('Likes')) FROM User WHERE name = $userId ) WHERE name != $userId  GROUP BY @rid),
        $d = (SELECT COUNT(@rid) AS anti_score, @rid AS id, name FROM (SELECT EXPAND(OUT('recommends').IN('does_not_recommend')) FROM User WHERE name = $userId ) WHERE name != $userId  GROUP BY @rid),
        $e = (SELECT @rid AS id, name FROM User WHERE name != $userId ),
        $union = UNIONALL($a, $b, $c, $d, $e))
        GROUP BY id))
        UNWIND game)
        WHERE game NOT IN (SELECT OUT().name FROM User WHERE name = $userId )
        GROUP BY game
        ORDER BY score DESC
        LIMIT 10`,
        {params: {userId: userId}}
    ).then((res) => {
        gameIds = [];
        for(let i = 0; i < res.length; i++) {
            gameIds.push(res[i].game);
        }
        return gameIds;
    });
}

module.exports = {recommendGames}