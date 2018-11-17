import React, { Component } from 'react';
import { infoBirds } from './data.json';
import './Game.css';
import './GameRes.css';

class Card extends Component{
  render(){
    return(
      <button key={this.props.id} id={this.props.id} className={"card "+(this.props.clicked ? "clicked " : " ")+(this.props.clicked ? "bird"+this.props.value+" " : null)} solved={(this.props.solved ? "true" : "false")} onClick={this.props.onClick}>
        <span className="number">{this.props.id+1}</span>
      </button>
    );
  }
}

class Game extends Component{
  constructor(props){
    super(props);
    // Create and array with all the props of a card, and shuffled randomly
    let temp = [],pos = shuffle([1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,12,12,12]);
    let bestTime = null;
    if(localStorage.getItem('bestTime')){bestTime=localStorage.getItem('bestTime').split(',');}
    for (let i = 0; i < 36; i++) {
      temp.push({id:i,value:pos[i],clicked:false,solved:false});
    }
    this.state = {
      cards: temp,
      infoBullet: Array(13).fill(false),
      info: Array(13).fill(false),
      previous: null,
      beforePrev: null,
      status: null,
      isGoodClick: true,
      solved: 0,
      minutes: 0,
      seconds: 0,
      millis: 0,
      running: false,
      start:false,
      bestTime: bestTime,
      finalM: false,
    };
    this._handleStartClick = this._handleStartClick.bind(this);
    this._handleStopClick = this._handleStopClick.bind(this);
    this._handleResetClick = this._handleResetClick.bind(this);
    this._startAll = this._startAll.bind(this);
    this.closeFm = this.closeFm.bind(this);
  }
  renderCard(id){
    return(
      <Card id={id} key={id} value={this.state.cards[id].value} clicked={this.state.cards[id].clicked ? true : false} solved={this.state.cards[id].solved} onClick={() => this.checkCards(id)}/>
    );
  }
  delayHide(e){
    // effect to leave for a second a mistaken revealed card
    let temp = this.state.cards;
    let temp2 = this.state.cards.slice();
    temp[e].clicked = true;
    this.setState({isGoodClick:false,cards:temp,status:"try again..."});
    setTimeout(function(){
      temp2[e].clicked = false;
      if(this.state.previous !== null){temp2[this.state.previous].clicked = false;}
      if(this.state.beforePrev !== null){temp2[this.state.beforePrev].clicked = false;}
      this.setState({isGoodClick:true,cards:temp2,previous:null,beforePrev:null});
    }.bind(this,temp2), 1000);
  }
  checkCards(e){
    // needed conditions to eval if a group of cards was solved
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
        // this is the final verification
      }else if((temp[e].value === temp[this.state.previous].value ) && (temp[e].value === temp[this.state.beforePrev].value ) ){
        let tempInfo = this.state.infoBullet;
        let finalM = false;
        tempInfo[temp[e].value] = true;
        temp[e].clicked = true;
        temp[e].solved = true;
        temp[this.state.previous].solved = true;
        temp[this.state.beforePrev].solved = true;
        let s = this.state.solved + 1;
        let m = "";
        if(s === 12){
          m = "Congratulations! you have unlocked all available content!!";
          this._handleStopClick();
          if(this.calculateBestTime()){
            let temp = [this.state.minutes,this.state.seconds];
            this.setState({bestTime: temp});
            // if theres a new local best time is save on a localStorage var
            localStorage.setItem('bestTime', temp);
          }
          finalM = true;
        }else{
          m = "Great!, you solved "+s+" cards";
        }
        this.setState({beforePrev: null,previous:null,status:m,solved:s,infoBullet:tempInfo,finalM:finalM});
      }else{
        this.delayHide(e);
      }
      this.setState({cards:temp});
    }
  }
  calculateBestTime(){
    let bt = false;
    if(this.state.bestTime !== null){
      if(Number(this.state.minutes) < Number(this.state.bestTime[0])){
          bt = true;
      }
      if(Number(this.state.bestTime[0]) === Number(this.state.minutes) ){
        if(Number(this.state.seconds) < Number(this.state.bestTime[1]) ){
          bt = true;
        }
      }
    }else{
      bt = true;
    }
    return bt;
  }

  renderInfo(id){
    //create the html content for each rewarded card, based on a external json data
    return(
      <div>
      <div className="infoBird">
        <span className="close" title="Close" onClick={() => this.closeInfo(id)}>X</span>
        <div className={"img bird"+id}></div>
        <div className={"imgf bird"+id}></div>
        <div className={"img2 bird"+id}></div>
        <div className="name">{infoBirds[id-1].name}</div>
        <div className="cientific"><i>{infoBirds[id-1].cientific}</i></div>
        <div className="description" dangerouslySetInnerHTML={{ __html: infoBirds[id-1].description}}></div>
      </div>
      <div className="overlay"></div>
      </div>
    );
  }
  showInfo(id){
    let temp = this.state.info;
    temp[id] = true;
    this.setState({info:temp});
    if(this.state.solved < 12){this._handleStopClick();}
  }
  closeInfo(id){
    let temp = this.state.info;
    temp[id] = false;
    this.setState({info:temp});
    if(this.state.solved < 12){this._handleStartClick();}
  }
  closeFm(){
    this.setState({finalM:false});
  }

  //General functions to handle the chronometer

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
    // add extra 0 to numbers before 10
      return value < 10 ? `0${value}` : value;
  }
  update(millis, seconds, minutes) {
      this.setState({
          millis: millis,
          seconds: seconds,
          minutes: minutes
      });
  }

  //Function to init the panel cards and the chronometer
  _startAll() {
   this.setState({
     start: true,
   });
   this._handleStartClick();
 }

  render(){
    // this const creates all the html cards based on the array general state
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
      <div className="App">
        <div className="statusbar">
          {this.state.start ?
            <span className="left" title="Elapsed time" ><span className="mins">{this.zeroPad(this.state.minutes)}:</span><span className="secs">{this.zeroPad(this.state.seconds)}:</span><span className="millis">0{this.state.millis}</span></span>
          : null }
          <span className="right">{this.state.status}</span>
        </div>

        {this.state.bestTime ? <span className="bestTime">Best time: <b>{this.zeroPad(this.state.bestTime[0])}:{this.zeroPad(this.state.bestTime[1])}</b></span>: null}

        {this.state.start ? null : <h1>Now, a brain exercise!</h1>}
        <p>Find three cards with the same image bird to reveal their information.</p>

        {this.state.start ? <div className="panel">{createAllCards()}</div> : <button className="btn-style" onClick={this._startAll}>Let's start!</button> }

        <div className="info">
          {this.state.solved >= 1 ? <span className="title">Rewards:</span> : null }
          {this.state.infoBullet[1] ? <button className="bird1" onClick={() => this.showInfo(1)} > <span>{infoBirds[0].name}</span> </button> : null }
          {this.state.infoBullet[2] ? <button className="bird2" onClick={() => this.showInfo(2)} > <span>{infoBirds[1].name}</span> </button> : null }
          {this.state.infoBullet[3] ? <button className="bird3" onClick={() => this.showInfo(3)} > <span>{infoBirds[2].name}</span> </button> : null }
          {this.state.infoBullet[4] ? <button className="bird4" onClick={() => this.showInfo(4)} > <span>{infoBirds[3].name}</span> </button> : null }
          {this.state.infoBullet[5] ? <button className="bird5" onClick={() => this.showInfo(5)} > <span>{infoBirds[4].name}</span> </button> : null }
          {this.state.infoBullet[6] ? <button className="bird6" onClick={() => this.showInfo(6)} > <span>{infoBirds[5].name}</span> </button> : null }
          {this.state.infoBullet[7] ? <button className="bird7" onClick={() => this.showInfo(7)} > <span>{infoBirds[6].name}</span> </button> : null }
          {this.state.infoBullet[8] ? <button className="bird8" onClick={() => this.showInfo(8)} > <span>{infoBirds[7].name}</span> </button> : null }
          {this.state.infoBullet[9] ? <button className="bird9" onClick={() => this.showInfo(9)} > <span>{infoBirds[8].name}</span> </button> : null }
          {this.state.infoBullet[10] ? <button className="bird10" onClick={() => this.showInfo(10)} > <span>{infoBirds[9].name}</span> </button> : null }
          {this.state.infoBullet[11] ? <button className="bird11" onClick={() => this.showInfo(11)} > <span>{infoBirds[10].name}</span> </button> : null }
          {this.state.infoBullet[12] ? <button className="bird12" onClick={() => this.showInfo(12)} > <span>{infoBirds[11].name}</span> </button> : null }
        </div>
        {this.state.info[1] ? this.renderInfo(1) : null }
        {this.state.info[2] ? this.renderInfo(2) : null }
        {this.state.info[3] ? this.renderInfo(3) : null }
        {this.state.info[4] ? this.renderInfo(4) : null }
        {this.state.info[5] ? this.renderInfo(5) : null }
        {this.state.info[6] ? this.renderInfo(6) : null }
        {this.state.info[7] ? this.renderInfo(7) : null }
        {this.state.info[8] ? this.renderInfo(8) : null }
        {this.state.info[9] ? this.renderInfo(9) : null }
        {this.state.info[10] ? this.renderInfo(10) : null }
        {this.state.info[11] ? this.renderInfo(11) : null }
        {this.state.info[12] ? this.renderInfo(12) : null }
        {this.state.finalM ?
          <div>
            <div className="finalMessage">
              <span className="close" title="Close" onClick={this.closeFm}>X</span>
              <p>Congratulations, you finish in</p>
              <p><b>{this.zeroPad(this.state.minutes)}</b> minutes & <b>{this.zeroPad(this.state.seconds)}</b> seconds</p>
            </div>
            <div className="overlay"></div>
          </div>
        : null }
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
