import React, { Component } from 'react';
import './Game.css';

class Card extends Component{
  render(){
    return(
      <button key={this.props.id} id={this.props.id} className={"card "+(this.props.clicked ? "clicked " : " ")+(this.props.clicked ? "bird"+this.props.value+" " : "")} solved={(this.props.solved ? "true" : "false")} onClick={this.props.onClick}>
        <span className="number">{this.props.id+1}</span>
      </button>
    );
  }
}

class Panel extends Component{
  constructor(props){
    super(props);
    let temp = [],pos = shuffle([1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,12]);
    for (let i = 0; i < 36; i++) {
      temp.push({id:i,value:pos[i],clicked:false,solved:false});
    }
    this.state = {
      cards: temp,
      previous: null,
      beforePrev: null,
      status: null,
      isGoodClick: true,
      solved: 0,
      minutes: 0,
      seconds: 0,
      millis: 0,
      running: false,
      start:false
    };
    this._handleStartClick = this._handleStartClick.bind(this);
    this._handleStopClick = this._handleStopClick.bind(this);
    this._handleResetClick = this._handleResetClick.bind(this);
    this._startAll = this._startAll.bind(this);
  }
  renderCard(id){
    return(
      <Card id={id} key={id} value={this.state.cards[id].value} clicked={this.state.cards[id].clicked ? true : false} solved={this.state.cards[id].solved} onClick={() => this.checkCards(id)}/>
    );
  }

  delayHide(e){
    let temp = this.state.cards;
    let temp2 = this.state.cards.slice();
    temp[e].clicked = true;
    this.setState({isGoodClick:false,cards:temp,status:"try again..."});
    setTimeout(function(){
      temp2[e].clicked = false;
      if(this.state.previous !== null){temp2[this.state.previous].clicked = false;}
      if(this.state.beforePrev !== null){temp2[this.state.beforePrev].clicked = false;}
      this.setState({isGoodClick:true,cards:temp2,previous:null,beforePrev:null});
      if(this.state.solved === 12){
        this._handleStopClick();
        this.setState({status:"Congratulations! you have unlocked all available content.!"});
      }
    }.bind(this,temp2), 1000);
  }

  checkCards(e){
    if(this.state.cards[e].solved === false && this.state.cards[e].clicked === false && this.state.isGoodClick === true){
      let temp = this.state.cards;
      if(this.state.previous === null){
        temp[e].clicked = true;
        this.setState({previous: e});
      }else if(this.state.beforePrev === null){
        let prev = this.state.previous;
        if((temp[prev].value === temp[e].value ) && prev !== e){
          temp[e].clicked = true;
          this.setState({beforePrev: prev,previous:e,status:"Just one more!"});
        }else{
          this.delayHide(e);
        }
      }else if((temp[e].value === temp[this.state.previous].value ) && (temp[e].value === temp[this.state.beforePrev].value ) ){
        temp[e].clicked = true;
        temp[e].solved = true;
        temp[this.state.previous].solved = true;
        temp[this.state.beforePrev].solved = true;
        let s = this.state.solved + 1;
        this.setState({beforePrev: null,previous:null,status:"Cool!",solved:s});
      }else{
        this.delayHide(e);
      }
      this.setState({cards:temp});
    }
  }
  _handleStartClick(event) {
      if (!this.state.running) {
          this.interval = setInterval(() => {
              this.tick();
          }, 100)
          this.setState({running: true})
      }
  }
  _handleStopClick(event) {
      if (this.state.running) {
          clearInterval(this.interval);
          this.setState({running: false})
      }
  }
  _handleResetClick(event) {
      this._handleStopClick();
      this.update(0, 0, 0);
  }
  tick() {
      let millis = this.state.millis + 1;
      let seconds = this.state.seconds;
      let minutes = this.state.minutes;
      if (millis === 10) {
          millis = 0;
          seconds = seconds + 1;
      }
      if (seconds === 60) {
          millis = 0;
          seconds = 0;
          minutes = minutes + 1;
      }
      this.update(millis, seconds, minutes);
  }
  zeroPad(value) {
      return value < 10 ? `0${value}` : value;
  }
  update(millis, seconds, minutes) {
      this.setState({
          millis: millis,
          seconds: seconds,
          minutes: minutes
      });
  }
  _startAll() {
   this.setState({
     start: true,
   });
 }
  render(){
    const createAllCards = () =>{
      let cards = [], count = 0
      const maxRow = 6, maxCol = 6
      for (let r = 0; r < maxRow; r++) {
        let row = []
        for (let c = 0; c < maxCol; c++) {
          row.push(this.renderCard(count))
          count++
        }
        cards.push(<div className="row" key={r}>{row}</div>)
      }
      return cards
    }
    return(
      <div>
      <div className="statusbar">
        <span className="left">
          <span className="mins">{this.zeroPad(this.state.minutes)}:</span>
          <span className="secs">{this.zeroPad(this.state.seconds)}:</span>
          <span className="millis">0{this.state.millis}</span>
        </span>
        <span className="right">{this.state.status}</span>
      </div>
        <div className="panel">
          {this.state.start ? createAllCards() : <button onClick={this._startAll}>Start!</button> }
          {this.state.start ? this._handleStartClick() : null }
        </div>
      </div>
    );
  }
}

class Game extends Component {
  render() {
    return (
      <div className="App">
      <h1>Now, a brain exercise!</h1>
      <p>Find three cards with the same bird to reveal their information.</p>
      <Panel />
      </div>
    );
  }
}



function shuffle(array) {
  var m = array.length, t, i;
  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);
    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

export default Game;
