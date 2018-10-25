function loadJSON(filePath) {
  // Load json file;
  var json = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}

// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status == 200) {
    return xmlhttp.responseText;
  } else {
    return null;
  }
}

var config = loadJSON("config.json");

new Vue({
  el: "#app",
  data() {
    return {
      projects: [],
      date: "",
      users: [],
      checkedProjects: [],
      checkedNames: [],
      info: []
    };
  },
  methods: {
    getProjectsByUserSinceDate: function(userName, date) {
      let headers = new Headers();
      headers.set("Authorization", "token " + config.token);

      const req = new XMLHttpRequest();
      req.open("GET", config.apiUrl + "users/" + userName + "/repos", false);
      req.setRequestHeader("Authorization", "token " + config.token);
      req.send(null);

      if (req.status === 200) {
        var value = JSON.parse(req.responseText);
        var that = this;
        console.log(value);
        value.forEach(function(value, index){
          if(that.date < value.created_at){
            if(that.checkedProjects.includes(value.name)){
              project = {
                owner : value.owner.login,
                name : value.name,
                commits : getCommits(that.user, value.name),
                url : value.url
              }
              that.info.push(project);
            }
          }
        });
          
      } else {
        console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
      }
    },
    getFormatDate: function(date){
      var formatDate = new Date(date);
      return formatDate;
    },
    getProjectNameByUserSinceDate: function(userName, date) {
      let headers = new Headers();
      headers.set("Authorization", "token " + config.token);

      const req = new XMLHttpRequest();
      req.open("GET", config.apiUrl + "users/" + userName + "/repos", false);
      req.setRequestHeader("Authorization", "token " + config.token);
      req.send(null);

      if (req.status === 200) {
        var value = JSON.parse(req.responseText);
        var that = this;
        value.forEach(function(value, index){
          console.log(value)
          if(that.date < value.created_at){
            if(!that.projects.includes(value.name)){
              that.projects.push(value.name);
            }
          }
        });
        
      } else {
        console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
      }
    },
    getProjectsNames(){
      var users = this.checkedNames;
      var sinceDate = this.getFormatDate(this.date);
      this.projects = [];

      var that = this;
      users.forEach(function(element) {
        that.getProjectNameByUserSinceDate(element, sinceDate);
      })
    },
    getProjects(){
      this.info = [];
      var users = this.checkedNames;
      var sinceDate = this.getFormatDate(this.date);

      var that = this;
      users.forEach(function(element) {
        that.getProjectsByUserSinceDate(element, sinceDate);
      })
    }
  },

  mounted() {
    this.users = config.users;
  }
});

function getCommits(username, repo) {
  var d = new Date();
  d.setHours(0, 0, 0);
  console.log(d.toISOString());

  const req = new XMLHttpRequest();
  req.open(
    "GET", config.apiUrl + "repos/" + username + "/" + repo + "/commits?since=" + d.toISOString, false);
  req.setRequestHeader("Authorization", "token " + config.token);
  req.send(null);

  if (req.status === 200) {
    return JSON.parse(req.responseText);
  } else {
    console.log("Status de la réponse: %d (%s)", req.status, req.statusText);
  }
}


var usersList = document.getElementById('usersList');
usersList.getElementsByClassName('anchor')[0].onclick = function (e) {
  if (usersList.classList.contains('visible'))
    usersList.classList.remove('visible');
  else
    usersList.classList.add('visible');
}

var projectsList = document.getElementById('projectsList');
projectsList.getElementsByClassName('anchor')[0].onclick = function (e) {
  if (projectsList.classList.contains('visible'))
    projectsList.classList.remove('visible');
  else
    projectsList.classList.add('visible');
}