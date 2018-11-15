import React, { Component } from 'react';
import './Game.css';

class Card extends Component{
  render(){
    return(
      <button key={this.props.id} id={this.props.id} className={"card "+(this.props.clicked ? "clicked" : "")} solved={(this.props.solved ? "true" : "false")} bird={this.props.value} onClick={this.props.onClick}>
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
    };
  }
  renderCard(id){
    return(
      <Card id={id} key={id} value={this.state.cards[id].value} clicked={this.state.cards[id].clicked ? true : false} solved={this.state.cards[id].solved} onClick={() => this.checkCards(id)}/>
    );
  }

  checkCards(e){
    if(this.state.cards[e].solved === false && this.state.cards[e].clicked === false){
      let temp = this.state.cards;
      if(this.state.previous === null){
        temp[e].clicked = true;
        this.setState({previous: e});
      }else if(this.state.beforePrev === null){
        let prev = this.state.previous;
        if((temp[prev].value === temp[e].value ) && prev != e){
          temp[e].clicked = true;
          this.setState({beforePrev: prev,previous:e,status:"One more..."});
        }else{
          temp[prev].clicked = false;
          this.setState({previous: null,status:"Try again"});
        }
      }else if((temp[e].value === temp[this.state.previous].value ) && (temp[e].value === temp[this.state.beforePrev].value ) ){
        temp[e].clicked = true;
        temp[e].solved = true;
        temp[this.state.previous].solved = true;
        temp[this.state.beforePrev].solved = true;
        this.setState({beforePrev: null,previous:null,status:"Cool!"});
      }else{
        temp[e].clicked = false;
        temp[this.state.previous].clicked = false;
        temp[this.state.beforePrev].clicked = false;
        this.setState({beforePrev: null,previous:null,status:"Try again"});
      }
      this.setState({cards:temp});
    }
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
        <p>{this.state.status}</p>
        <div className="panel">
          {createAllCards()}
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
