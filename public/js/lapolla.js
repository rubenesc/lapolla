    var GamesForm = { 

        groupRankingHash: null,
         groups:['a','b','c','d','e','f','g','h'],
        // groups:['a'],
        groupKeys: null,
        knockoutKeys: null,

        initialize: function(){
            this.groupRankingHash = {};
            this.groupKeys = {};
            this.groupKeys["a"] = [49,51];
            this.groupKeys["b"] = [51,49];
            this.groupKeys["c"] = [50,52];
            this.groupKeys["d"] = [52,50];
            this.groupKeys["e"] = [53,55];
            this.groupKeys["f"] = [55,53];
            this.groupKeys["g"] = [54,56];
            this.groupKeys["h"] = [56,54];

            this.knockoutKeys = {};
            this.knockoutKeys[49] = [49, 1,57,"w"];
            this.knockoutKeys[50] = [50, 2,57,"w"];
            this.knockoutKeys[51] = [51, 1,59,"w"];
            this.knockoutKeys[52] = [52, 2,59,"w"];
            this.knockoutKeys[53] = [53, 1,58,"w"];
            this.knockoutKeys[54] = [54, 2,58,"w"];
            this.knockoutKeys[55] = [55, 1,60,"w"];
            this.knockoutKeys[56] = [56, 2,60,"w"];

            this.knockoutKeys[57] = [57, 1,61,"w"];
            this.knockoutKeys[58] = [58, 2,61,"w"];
            this.knockoutKeys[59] = [59, 1,62,"w"];
            this.knockoutKeys[60] = [60, 2,62,"w"];

            this.knockoutKeys[61] = [61, 1,64,"w"];
            this.knockoutKeys[62] = [62, 2,64,"w"];
            
            //this.knockoutKeys[64] = [1,1,"w"];

            this.knockoutKeys[63] = [62,2,63,"l"];
            this.knockoutKeys[64] = [61,1,63,"l"];

            GamesForm.sortTeams();

        },
        
        setupActions: function(){

            $('body').on('click', '#save-data', function(e){
               e.preventDefault();
               $("#games-form").submit();

            }); 

            $('body').on('click', '#logout', function(e){
               e.preventDefault();
                $('#games-form').attr('action', "/logout").submit();
            }); 

            $('#stage-1 input').keyup(function () {
                GamesForm.sortTeams();
            });

            $('.knockout input').keyup(function () {
                GamesForm.processKnockOutStage();
            });

        },

        buildGameInfoFromMatchId: function(matchId){

            var matchDom = $("input[name='matchId_"+matchId+"']").parent().parent();

            var matchInfo = this.buildGameInfoFromDom(matchDom);


            //Since we have the matchDom, verify if we should show or hide the 
            //penalties input

            if (matchInfo && matchInfo.gol1 && matchInfo.gol2 
            	&& matchInfo.gol1 === matchInfo.gol2 ){

            	matchDom.find("input[name='p_"+matchId+"_1']").show();
            	matchDom.find("input[name='p_"+matchId+"_2']").show();
            } else {

            	matchDom.find("input[name='p_"+matchId+"_1']").hide();
            	matchDom.find("input[name='p_"+matchId+"_2']").hide();

            	matchDom.find("input[name='p_"+matchId+"_1']").val(0);
            	matchDom.find("input[name='p_"+matchId+"_2']").val(0);

            }

            return matchInfo;

        },

        buildGameInfoFromDom: function(docContext){

            var matchId = docContext.find("input[name^='matchId_']").val();

            var game = {
                matchId: matchId,
                name1: docContext.find(".team1-name").text(),
                name2: docContext.find(".team2-name").text(),
                flag1: docContext.find(".team1-flag").attr('src'),
                flag2: docContext.find(".team2-flag").attr('src'),                     
                code1: docContext.find("input[name='team_"+matchId+"_code_1']").val(),
                code2: docContext.find("input[name='team_"+matchId+"_code_2']").val(),
                gol1: docContext.find("input[name='g_"+matchId+"_1']").val(),
                gol2: docContext.find("input[name='g_"+matchId+"_2']").val(),
                pen1: docContext.find("input[name='p_"+matchId+"_1']").val(),
                pen2: docContext.find("input[name='p_"+matchId+"_2']").val()
            }

            return game;
        },

        retrieveTeam: function(match, gameResult){

            var teamPos = null;

            //both teams filled in.
            if (match.code1 && match.code2){

                if (match.gol1 > match.gol2){
                    teamPos = 1;
                } else if (match.gol1 < match.gol2) {
                    teamPos = 2;
                } else if (match.gol1 === match.gol2){
                	//decide by penalties
	                if (match.pen1 > match.pen2){
	                    teamPos = 1;
	                } else if (match.pen1 < match.pen2) {
	                    teamPos = 2;
	                }
                }

                if (teamPos){
                    //I found a winning team, no tie.

                    if (gameResult && gameResult === "l"){
                        //invert team pos, I need the loser.
                        teamPos = (teamPos === 1) ? 2 : 1;
                    }

                    return {
                        matchId: match["matchId"],
                        code: match["code"+teamPos],
                        flag: match["flag"+teamPos],
                        name: match["name"+teamPos],
                        gol: match["gol"+teamPos],
                        pen: match["pen"+teamPos],

                    }
                }

            }

            return null;

        },

        sortTeams: function(){

            for (var j in this.groups){
                var group = this.groups[j];
                var groupHashMap = {};
                var gamesArr = [];
                //console.log("group: " + group);
                $("#group-"+group+" li").each(function(i){

                    var game = GamesForm.buildGameInfoFromDom($(this));
                    gamesArr.push(game);
                });

                // console.log("populated game arry");
                var game, auxTeam, team1, team2;
                for (var i in gamesArr){
                    game = gamesArr[i];
                    auxTeam = groupHashMap[game.code1];
                    if (!auxTeam){
                        auxTeam = {"team": game.code1, "name": game.name1, "flag": game.flag1, "p": 0, "gf":0, "ga":0, "gd": 0};
                        groupHashMap[game.code1] = auxTeam;
                    }

                    auxTeam = groupHashMap[game.code2];
                    if (!auxTeam){
                        auxTeam = {"team": game.code2, "name": game.name2, "flag": game.flag2, "p": 0, "gf":0, "ga":0, "gd": 0};
                        groupHashMap[game.code2] = auxTeam;
                    }

                }

                //populate groupHashMap
                //calculate points and assign
                for(var i in gamesArr){
                    game = gamesArr[i];

                    team1 = groupHashMap[game.code1];
                    team1.gf = team1.gf + +game.gol1;
                    team1.ga = team1.ga + +game.gol2;
                    team1.gd = team1.gf - team1.ga;

                    team2 = groupHashMap[game.code2];
                    team2.gf = team2.gf + +game.gol2;
                    team2.ga = team2.ga + +game.gol1;
                    team2.gd = team2.gf - team2.ga;

                    if (game.gol1 === game.gol2){

                        team1.p = team1.p + 1;
                        team2.p = team2.p + 1;
                    } else if (game.gol1 > game.gol2) {

                        team1.p = team1.p + 3;
                        team2.p = team2.p + 0;
                    } else {

                        team1.p = team1.p + 0;
                        team2.p = team2.p + 3;

                    }

                    groupHashMap[game.code1] = team1;
                    groupHashMap[game.code2] = team2;

                }

                var groupRanking = [];
                for (var i in groupHashMap){
                    groupRanking.push(groupHashMap[i]);
                };


                groupRanking.sort(function(a,b){
                  return b.p - a.p;
                });

                this.groupRankingHash[group] = groupRanking;

            }

            GamesForm.processGroupWinners();
            GamesForm.processKnockOutStage();


        },

        processGroupWinners: function(){

            console.log("... processGroupWinners ...");

            for (var j in this.groups){

                var group = this.groups[j];
                var groupRanking = this.groupRankingHash[group];
                var key = this.groupKeys[group];

                var matchId1 = key[0];
                var team1 = groupRanking[0];
                var team1Dom = $("input[name='matchId_"+matchId1+"']").parent();

                var currentTeam1 = team1Dom.find("input[name='team_"+matchId1+"_code_1']").val();

                if ( !(currentTeam1 && currentTeam1 === team1.team) ){
                    team1Dom.find("input[name='team_"+matchId1+"_code_1']").val(team1.team);
                    team1Dom.find("input[name='g_"+matchId1+"_1']").val(0);
                    team1Dom.find(".team1-name").text(team1.name);
                    team1Dom.find(".team1-flag").attr("src", team1.flag);
                }

                var matchId2 = key[1];
                var team2 = groupRanking[1];
                var team2Dom = $("input[name='matchId_"+matchId2+"']").parent();

                var currentTeam2 = team2Dom.find("input[name='team_"+matchId2+"_code_2']").val();

                if ( !(currentTeam2 && currentTeam2 === team2.team) ){
                    team2Dom.find("input[name='team_"+matchId2+"_code_2']").val(team2.team);
                    team2Dom.find("input[name='g_"+matchId2+"_2']").val(0);
                    team2Dom.find(".team2-name").text(team2.name);
                    team2Dom.find(".team2-flag").attr("src", team2.flag);
                }
 
                console.log("group: ["+group+"]["+ team1.team +"][" + team2.team +"]");

            };
        },

        processKnockOutStage: function(){
            
            console.log("... processKnockOutStage ...");

            var key, pos, matchId, gameResult, nextMatchId, matchData, teamData;

            for (var i = 49; i<=64; i++){

                key = this.knockoutKeys[i];                
                matchId = key[0];
                pos = key[1]; //Position in next match, home or visit
                nextMatchId = key[2]; 
                gameResult = key[3]; 

                matchData = this.buildGameInfoFromMatchId(matchId);

                teamData = this.retrieveTeam(matchData, gameResult);

                var nextMatchDom = $("input[name='matchId_"+nextMatchId+"']").parent();

                var nextTeam = nextMatchDom.find("input[name='team_"+nextMatchId+"_code_"+pos+"']").val();

                if (teamData){
                    //Is there a team already set? No need to set it if its the same.
                    
                    if ( !(nextTeam && nextTeam === teamData.code) ){

                        GamesForm.setTeamDataInDom
                            (nextMatchDom, nextMatchId, pos, teamData.code,
                                teamData.flag, teamData.name, teamData.gol, teamData.pen);

                        console.log("match: ["+matchId+"]["
                            +nextMatchId+"]["+pos+"]["+ teamData.code +"][set!]");
                    }
                    
                } else {
                    //remove team from next match if any, there was no winning team
                    //in current match
                    if (nextTeam){

                        GamesForm.setTeamDataInDom
                            (nextMatchDom, nextMatchId, pos, "", "", "", "", "");

                        console.log("match: ["+matchId+"]["
                            +nextMatchId+"]["+pos+"][cleared]");
                    }                

                }

            }
        },

        setTeamDataInDom: function(nextMatchDom, nextMatchId, pos, code, flag, name, gol, pen){

            nextMatchDom.find("input[name='team_"+nextMatchId+"_code_"+pos+"']").val(code);
            nextMatchDom.find("input[name='g_"+nextMatchId+"_"+pos+"']").val(gol);
            nextMatchDom.find("input[name='p_"+nextMatchId+"_"+pos+"']").val(pen);
            nextMatchDom.find(".team"+pos+"-name").text(name);
            nextMatchDom.find(".team"+pos+"-flag").attr("src", flag);

        }

    }
