/* globals $:false, define:false, document:false, window:false */
define("app",[
  'jquery',
  'app/views/main',
  'app/views/board',
  'app/views/canvas',
  'app/boardconnection',
  'app/boardmessagehandler',
  'app/toolbar',
  'app/utils',
  'app/models/board',
  'bootstrap'
], 

function($, MainView, BoardView, BoardCanvas, BoardConnection, BoardMessageHandler, Toolbar, Utils, Board){
    var initialize = function(){

        var boardConnection, boardView, board;

        function initBoard(){
            var boardId = Utils.getBoardId();
            var boardMessageHandler = new BoardMessageHandler();
            boardConnection = new BoardConnection(boardId, boardMessageHandler);
            boardView = new BoardView({boardConnection: boardConnection});
            boardMessageHandler.setBoardView(boardView);

            var _this = this;

            board = new Board({id: boardId});
            board.fetch({success: function(){
                var mainView = new MainView({boardView: boardView, board: board});
                mainView.render();
            }});
        }

        $(document).ready(function() {
          initBoard();
          loadToolbar();
          var pencil_tool = $("#pencil_tools");
          pencil_tool.mouseover(function(){
              $("#pencil_green_tool").fadeIn('fast');
              $("#pencil_red_tool").fadeIn('fast');
              $("#pencil_blue_tool").fadeIn('fast');
          });
          pencil_tool.mouseleave(function(){
              $("#pencil_green_tool").fadeOut('fast');
              $("#pencil_red_tool").fadeOut('fast');
              $("#pencil_blue_tool").fadeOut('fast');
          });

          $(window).bind("beforeunload", function() {
              saveScreenshot();
              boardConnection.disconnect();
          });
        });

        function loadToolbar(){
            var toolbar = new Toolbar();
            toolbar.addTool($("#eraser_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/eraser_disabled.ico),default');
                        boardView.selectEraserTool();
                    }
            }));

            toolbar.addTool($("#postit_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/postit_disabled.ico),default');
                        boardView.selectPostitTool();
                    }
            }));

            toolbar.addTool($("#pencil_black_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/pencil_disabled.ico),default');
                        boardView.selectPencilTool("black");
                    }
            }));

            toolbar.addTool($("#pencil_green_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/pencil_green_disabled.ico),default');
                        boardView.selectPencilTool("green");
                        $("#pencil_black_tool").addClass("tool_enabled");
                   }
            }));

            toolbar.addTool($("#pencil_red_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/pencil_red_disabled.ico),default');
                        boardView.selectPencilTool("red");
                        $("#pencil_black_tool").addClass("tool_enabled");
                    }
            }));

            toolbar.addTool($("#pencil_blue_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','url(/static/images/pencil_blue_disabled.ico),default');
                        boardView.selectPencilTool("blue");
                        $("#pencil_black_tool").addClass("tool_enabled");
                    }
            }));

            toolbar.addTool($("#clear_lines_tool").tool(toolbar, {
                    "action": function(){
                        boardView.clearLines();
                    },
                    "confirmable": true,
                    "exclusive": false,
                    "keep_selected": false
            }));

            toolbar.addTool($("#rectline_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','crosshair');
                        boardView.selectRectLineTool("FF000000");
                    }
            }));

            toolbar.addTool($("#text_tool").tool(toolbar, {
                    "action": function(){
                        $("#board").css('cursor','crosshair');
                        boardView.selectTextTool();
                    }
            }));

            toolbar.addTool($("#undo-tool").tool(toolbar, {
                "action": function(){
                    boardView.undo();
                },
                "exclusive": false,
                "keep_selected": false
            }));

            toolbar.addTool($("#save-tool").tool(toolbar, {
                "action": function(e){
                    saveScreenshot(function(board){
                        document.location.href = document.location.href + ".png";
                    });
                },
                "exclusive": false,
                "keep_selected": false
            }));
        }

        function saveScreenshot(callback){
            html2canvas(document.getElementById("board"), {
                background: '#fff',
                onrendered: function(canvas) {
                    var extra_canvas = document.createElement("canvas");
                    extra_canvas.setAttribute('width', 300);
                    extra_canvas.setAttribute('height', 150);
                    var ctx = extra_canvas.getContext('2d');
                    ctx.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,300,150);
                    var dataURL = extra_canvas.toDataURL();
                    board.save({screenshot: dataURL}, {
                        success: function(board){
                            if (callback) { callback(board);}
                        }
                    });
                }
            });
        }
  };

  return {
    initialize: initialize
  };
});
