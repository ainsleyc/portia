ASTool.ProjectIndexController = Em.ArrayController.extend(ASTool.BaseControllerMixin, {

	needs: ['application', 'navigation', 'spider_index'],

	documentView: null,

	spiderPage: null,

	nameBinding: 'slyd.project',

	navigationLabelBinding: 'slyd.project',

	createSpiderDisabled: function() {
		return Em.isEmpty(this.get('spiderPage'));
	}.property('spiderPage'),

	addSpider: function() {
		var siteUrl = this.get('spiderPage') || this.get('controllers.application.siteWizard');
		if (siteUrl.indexOf('http') != 0) {
			siteUrl = 'http://' + siteUrl;
		}
		var newSpiderName = this.getUnusedName(URI.parse(siteUrl).hostname, this.get('content'));
		this.set('controllers.application.siteWizard', siteUrl);
		var spider = ASTool.Spider.create( 
			{ 'name': newSpiderName,
			  'start_urls': [],
			  'follow_patterns': [],
			  'exclude_patterns': [],
			  'init_requests': [],
			  'templates': [] });
		this.pushObject(newSpiderName);
		this.set('spiderPage', null);
		return this.get('slyd').saveSpider(spider, newSpiderName).then(function() {
				this.editSpider(newSpiderName);
		}.bind(this), function(error) {
			console.log(error);
		});
	},

	editSpider: function(spiderName) {
    ASTool.ToolboxViewMixin.expandToolbox = false;
		this.get('slyd').loadSpider(spiderName).then(function(spider) {
			this.transitionToRoute('spider', spider);
		}.bind(this));
	},

  checkFinished: function() {
    var finished = true;
    this.get('model').forEach(function (model) {
      if(!model.finished) {
        finished = false;
      }
    });
    return finished;
  }.property('spiderPage'),

  finishProject: function() {
    var projectId = this.get('controllers.navigation.currentRoute.label')
		this.get('slyd').factualFinishProject(projectId);
  },

	actions: {

		editSpider: function(spiderName) {
			this.editSpider(spiderName);
		},

		addSpider: function() {
			this.addSpider();
		},

		deleteSpider: function(spiderName) {
			if (confirm('Are you sure you want to delete spider ' + spiderName + '?')) {
				this.get('slyd').deleteSpider(spiderName);
				this.removeObject(spiderName);
			}
		},

    finishProject: function() {
      this.finishProject();
    },

		rename: function(oldName, newName) {
			this.get('slyd').renameProject(oldName, newName).then(
				function() {
					this.replaceRoute('project', { id: newName });
				}.bind(this),
				function(reason) {
					this.set('name', oldName);
					alert('The name ' + newName + ' is not a valid project name.');
				}.bind(this)
			);
		},

	},

	willEnter: function() {
		this.get('documentView').showSpider();
		if (this.get('controllers.application.siteWizard')) {
			Em.run.next(this, this.addSpider);
		}
	},
});
