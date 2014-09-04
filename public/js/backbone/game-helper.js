   

App.Helper.Game = { 

        canEdit: null,

        groups: [{group: 'a'}, {group: 'b'}, {group: 'c'},
                 {group: 'd'}, {group: 'e'}, {group: 'f'},
                 {group: 'g'}, {group: 'h'} ],

        knockout: [{group: '8'}, {group: '4'}, {group: '2'},
                 {group: '3'}, {group: '1'} ],

        groupRankingHash: null,

        groupKeys: null,

        knockoutKeys: null,

        koTitles: null,

        isNumberRegex: RegExp(/^\d+$/),

        initialize: function(){

            var userCanEdit = 'true';//$(".container-fluid").find("input[name='user-can-edit']").val();
            if (userCanEdit && userCanEdit === 'true'){
                canEdit = true;
            } else {
                canEdit = false;
            }

            this.groupRankingHash = {};
            
            this.groupKeys = {};
            this.groupKeys["a"] = {"first": 49,"second": 51};
            this.groupKeys["b"] = {"first": 51,"second": 49};
            this.groupKeys["c"] = {"first": 50,"second": 52};
            this.groupKeys["d"] = {"first": 52,"second": 50};
            this.groupKeys["e"] = {"first": 53,"second": 55};
            this.groupKeys["f"] = {"first": 55,"second": 53};
            this.groupKeys["g"] = {"first": 54,"second": 56};
            this.groupKeys["h"] = {"first": 56,"second": 54};

            this.knockoutKeys = {};
            this.knockoutKeys[49] = {"matchId": 49, "position": 1, "nextMatchId": 57, "advanceResult": "w"};
            this.knockoutKeys[50] = {"matchId": 50, "position": 2, "nextMatchId": 57, "advanceResult": "w"};
            this.knockoutKeys[51] = {"matchId": 51, "position": 1, "nextMatchId": 59, "advanceResult": "w"};
            this.knockoutKeys[52] = {"matchId": 52, "position": 2, "nextMatchId": 59, "advanceResult": "w"};
            this.knockoutKeys[53] = {"matchId": 53, "position": 1, "nextMatchId": 58, "advanceResult": "w"};
            this.knockoutKeys[54] = {"matchId": 54, "position": 2, "nextMatchId": 58, "advanceResult": "w"};
            this.knockoutKeys[55] = {"matchId": 55, "position": 1, "nextMatchId": 60, "advanceResult": "w"};
            this.knockoutKeys[56] = {"matchId": 56, "position": 2, "nextMatchId": 60, "advanceResult": "w"};

            this.knockoutKeys[57] = {"matchId": 57, "position": 1, "nextMatchId": 61, "advanceResult": "w"};
            this.knockoutKeys[58] = {"matchId": 58, "position": 2, "nextMatchId": 61, "advanceResult": "w"};
            this.knockoutKeys[59] = {"matchId": 59, "position": 1, "nextMatchId": 62, "advanceResult": "w"};
            this.knockoutKeys[60] = {"matchId": 60, "position": 2, "nextMatchId": 62, "advanceResult": "w"};

            this.knockoutKeys[61] = {"matchId": 61, "position": 1, "nextMatchId": 64, "advanceResult": "w"};
            this.knockoutKeys[62] = {"matchId": 62, "position": 2, "nextMatchId": 64, "advanceResult": "w"};
            
            //this.knockoutKeys[64] = {"matchId": 1,1 " "nextMatchId": position":,"advanceResult": "w"};

            this.knockoutKeys[63] = {"matchId": 62, "position":2, "nextMatchId": 63, "advanceResult": "l"};
            this.knockoutKeys[64] = {"matchId": 61, "position":1, "nextMatchId": 63, "advanceResult": "l"};

            this.knockoutKeys[65] = {"matchId": 63, "position": null, "nextMatchId": null, "advanceResult": "n"};
            this.knockoutKeys[66] = {"matchId": 64, "position": null, "nextMatchId": null, "advanceResult": "n"};

            this.koTitles = {};
            this.koTitles[49]="1 Group A vs 2 Group B"
            this.koTitles[50]="1 Group C vs 2 Group D"
            this.koTitles[51]="1 Group B vs 2 Group A"
            this.koTitles[51]="1 Group B vs 2 Group A"
            this.koTitles[52]="1 Group D vs 2 Group C"
            this.koTitles[53]="1 Group E vs 2 Group F"
            this.koTitles[54]="1 Group G vs 2 Group H"
            this.koTitles[55]="1 Group F vs 2 Group E"
            this.koTitles[56]="1 Group H vs 2 Group G"
            this.koTitles[57]="Winner 49 vs Winner 50"
            this.koTitles[58]="Winner 53 vs Winner 54"
            this.koTitles[59]="Winner 51 vs Winner 52"
            this.koTitles[60]="Winner 55 vs Winner 56"
            this.koTitles[61]="Winner 57 vs Winner 58"
            this.koTitles[62]="Winner 59 vs Winner 60"
            this.koTitles[63]="Loser 61 vs Loser 62"
            this.koTitles[64]="Winner 61 vs Winner 62"

        },

        /*
            Is Stage Group Stage
            return: 
                true: group Stage
                false: knockout Stage
        */
        isGroupStage: function(stage){
            return !this.isNumberRegex.test(stage);
        },

        /*
            Teams by Group
                [team1, 
                 team2, 
                 team3, 
                 team4]                    
        */
        buildGroupStandings: function(gamesCol){

            var teams = [];
            var groupTeamsHashMap = {}; //contains a hash with the 4 teams of the group and its info.
            var game, auxTeam, team1, team2;
            var hmA = {};

            var currentMatchTeam1Points = 0;
            var currentMatchTeam2Points = 0;


            gamesCol.each(function(game) {

                team1 = groupTeamsHashMap[game.get("team1").code];
                team2 = groupTeamsHashMap[game.get("team2").code];

                if (!team1){
                    team1 = {"team": game.get("team1"), "w":0, "d": 0, "l": 0, "p": 0, "gf":0, "ga":0, "gd": 0};
                    //teams.push(auxTeam);                        
                }

                if (!team2){
                    team2 = {"team": game.get("team2"), "w":0, "d": 0, "l": 0, "p": 0, "gf":0, "ga":0, "gd": 0};
                    //teams.push(auxTeam);                        
                }

                team1.gf = team1.gf + +game.get("gol1");
                team1.ga = team1.ga + +game.get("gol2");
                team1.gd = team1.gf - team1.ga;

                team2.gf = team2.gf + +game.get("gol2");
                team2.ga = team2.ga + +game.get("gol1");
                team2.gd = team2.gf - team2.ga;

                if (game.get("gol1") === game.get("gol2")){

                    currentMatchTeam1Points = 1;
                    currentMatchTeam2Points = 1;

                    team1.d += 1;
                    team2.d += 1;

                } else if (game.get("gol1") > game.get("gol2")) {

                    currentMatchTeam1Points = 3;
                    currentMatchTeam2Points = 0;

                    team1.w += 1;
                    team2.l += 1;

                } else {

                    currentMatchTeam1Points = 0;
                    currentMatchTeam2Points = 3;

                    team1.l += 1;
                    team2.w += 1;
                }

                team1.p = team1.p + currentMatchTeam1Points;
                team2.p = team2.p + currentMatchTeam2Points;

                groupTeamsHashMap[game.get("team1").code] = team1;
                groupTeamsHashMap[game.get("team2").code] = team2;

                var hmb = {};
                hmb[game.code1] = currentMatchTeam1Points;
                hmb[game.code2] = currentMatchTeam2Points;
                hmA[game.code1+"-"+game.code2] = hmb;
                hmA[game.code2+"-"+game.code1] = hmb;

            });         


            var groupRanking = [];
            for (var i in groupTeamsHashMap){
                groupRanking.push(groupTeamsHashMap[i]);
            };

            groupRanking.sort(function(a,b){

                var result = b.p - a.p;

                if (result === 0){
                    result = b.gd - a.gd;
                } else {
                    return result;
                }

                if (result === 0){
                    result = b.gf - a.gf;
                } else {
                    return result;
                }

                if (result === 0){

                    var hmb2 = hmA[b.team.code+"-"+a.team.code];
                    if (!hmb2){
                        hmb2 = hmA[a.team.code+"-"+b.team.code];
                    }

                    if (hmb2){
                        result = hmb2[b.team.code] - hmb2[a.team.code];
                        if (result !== 0){
                            return result;
                        }
                    }

                } 

                return b.p - a.p;
            });                


            // console.log("ranking for group ...");
            // var team;
            // for(var i = 0; i<groupRanking.length; i++){
            //  team = groupRanking[i];
            //  console.log("["+ ( i + 1 )+"]["+team.name+"]["+team.gf+"]["+team.ga+"]["+team.gd+"]["+team.p+"]");
            // }


            return groupRanking;            

        },          

        /*
            Games by Group HashMap 
                {a: [game1, game2, game3, game4, game5, game6]},
                {b: [game1, game2, game3, game4, game5, game6]},
                ...
        */
        buildGroupGamesHM: function(games){

           var groupGamesHashMap = {}; //contains a hash with the 4 teams of the group and its info.

            for (var i=0; i<games.length; i++){
                // console.dir(t[i].team1.name + " vs " + t[i].team2.name + ": " + t[i].group);
                
                var group = games[i].group;
                var groupGames = groupGamesHashMap[group];
                if (!groupGames){
                    groupGames = [];
                }

                groupGames.push(games[i]);

                groupGamesHashMap[group] = groupGames;
            }

            return groupGamesHashMap;
        },

        retrieveAdvancingTeam: function(gameModel, gameResult){

            var teamPos = null;

            //both teams filled in.
            if (gameModel.get("team1") && gameModel.get("team2")){

                if (gameModel.get("gol1") > gameModel.get("gol2")){
                    teamPos = 1;
                } else if (gameModel.get("gol1") < gameModel.get("gol2")) {
                    teamPos = 2;
                } else if (gameModel.get("gol1") === gameModel.get("gol2")){
                    //decide by penalties
                    if (gameModel.get("pen1") > gameModel.get("pen2")){
                        teamPos = 1;
                    } else if (gameModel.get("pen1") < gameModel.get("pen2")) {
                        teamPos = 2;
                    }
                }

                if (teamPos){

                    //I found a winning team, no tie.

                    if (gameResult && gameResult === "l"){
                        //invert team pos, I need the loser of the game, usually for 3th and 4th place.
                        teamPos = (teamPos === 1) ? 2 : 1;
                    }

                    return gameModel.get("team"+teamPos);

                }

            }

            return null; //draw game

        } 

    } 