
/** @jsx React.DOM */

/*
Let's see...
*/

var globalListOfSpecs = [
  {
    layout: [{}, "AND", {}]
  },
  {
    layout: [{}, "OR", {}]
  },
  {
    layout: ["NOT", {}]
  },
  {
    layout: ["Project =", {}]
  },
  {
    layout: ["State =", {}]
  },
  {
    layout: ["Open"]
  },
  {
    layout: ["In Progress"]
  },
  {
    layout: ["QA"]
  },
  {
    layout: ["Resolved"]
  },
  {
    layout: ["Foo Project"]
  },
  {
    layout: ["Bar Project"]
  },
  {
    layout: ["Baz Project"]
  }
];

for(var i = 0; i < globalListOfSpecs.length; i++) {
  globalListOfSpecs[i].label = String(globalListOfSpecs[i].layout.filter(function(s) {return typeof s === "string"}));
  globalListOfSpecs[i].value = String(globalListOfSpecs[i].layout.filter(function(s) {return typeof s === "string"}));
}

var Token = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func
  },
  render: function() {
    var className = "token";
    if(this.props.color) {
      className += " " + this.props.color;
    }
    var closeButton = []
    if(this.props.onClose) {
      closeButton = [<a className="close-button" onClick={this.props.onClose}>&times;</a>];
    }
    return (
      <div className={className}>
        {this.props.children}
        {closeButton}
      </div>
    );
  }
});

























var Instance = function(spec, values) {
  this.listeners = [];
  this.spec = spec;
  if (!values) {
    values = spec.layout.filter(function(l) {
      return typeof l === "object";
    }).map(function(l) {
      return null;
    });
  }
  this.values = values;
}

Instance.prototype.onChange = function onChange(listener) {
  this.listeners.push(listener);
};

Instance.prototype.offChange = function offChange(listener) {
  this.listeners.splice(this.listeners.indexOf(listener), 1);
};

Instance.prototype.setValue = function setValue(index, value) {
  this.values[index] = value;
  this.listeners.forEach(function(listener) {
    listener(this);
  }.bind(this));
};
















var ActiveToken = React.createClass({
  propTypes: {
    instance: React.PropTypes.instanceOf(Instance),
    onClose: React.PropTypes.func
  },
  componentDidMount: function() {
    this.props.instance.onChange(this.doForceUpdate);
  },
  componentWillUnmount: function() {
    this.props.instance.offChange(this.doForceUpdate);
  },
  doForceUpdate: function() {
    this.forceUpdate();
  },
  render: function() {
    var instance = this.props.instance;
    var spec = instance.spec;
    var valueIndex = 0;
    var children = spec.layout.map(function(placeholder) {
      if (typeof placeholder === "string") {
        return placeholder;
      } else {
        // Keep the current valueIndex around for the callback to use. I've
        // heard tell of a new keyword, let, that supposedly allows one to do
        // this sort of thing properly - investigate switching this to use
        // that instead.
        return (function(permanentValueIndex) {
          var value = instance.values[permanentValueIndex];
          if (value == null) {
            var onSpecChosen = function(spec) {
              instance.setValue(permanentValueIndex, new Instance(spec));
            };
            return <SingleTokenChooser onSpecChosen={onSpecChosen}/>
          } else {
            var onClose = function() {
              instance.setValue(permanentValueIndex, null);
            };
            return <ActiveToken instance={value} onClose={onClose}/>
          }
        }(valueIndex++));
      }
    });
    return (<Token onClose={this.props.onClose} color="blue">
      {children}
    </Token>);
  }
});

























var SingleTokenChooser = React.createClass({
  propTypes: {
    onSpecChosen: React.PropTypes.func, // One argument, the spec itself, exactly as present in globalListOfSpecs
    placeholder: React.PropTypes.string
  },
  componentDidMount: function() {
    var textField = $(this.getDOMNode());
    textField.autocomplete({
      minLength: 0,
      source: globalListOfSpecs,
      focus: function(event, ui) {
        return false;
      },
      select: function(event, ui) {
        textField.val('');
        if(this.props.onSpecChosen) {
          this.props.onSpecChosen(ui.item);
        }
        return false;
      }.bind(this)
    }).autocomplete("instance")._renderItem = function(ul, item) {
      return $(React.renderComponentToString(<div><ActiveToken instance={new Instance(item)}/></div>)).appendTo(ul);
    };
  },
  componentWillUnmount: function() {
    $(this.getDOMNode()).autocomplete("destroy");
  },
  render: function() {
    var width = "25px";
    if(this.props.width) {
      width = this.props.width
    }
    var placeholder = "";
    if(this.props.placeholder) {
      placeholder = this.props.placeholder;
    }
    return (
      <input type="text" style={{"width": width, "margin": "1px"}} placeholder={placeholder}/>
    );
  }
});




var TagContainer = React.createClass({
  getInitialState: function() {
    return {
      children: []
    }
  },
  render: function() {
    return <div>
      {childChoosers}
    </div>;
  }
});

React.renderComponent(
  <div>
    <ActiveToken instance={new Instance(globalListOfSpecs[0])}/>
    <SingleTokenChooser width="100px"/>
  </div>,
  document.getElementById('contentGoesHere')
);


