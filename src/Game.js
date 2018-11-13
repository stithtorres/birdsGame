import React, { Component } from 'react';
import './Game.css';

class Card extends Component{
  render(){
    return(
      <button className="card">
      {this.props.value}
      </button>
    );
  }
}

class Panel extends Component{
  renderCard(i){
    return(
      <Card value={i} />
    );
  }
  createAllCards = () =>{
    let cards = [], count = 0
    const maxRow = 6, maxCol = 6
    for (let r = 0; r < maxRow; r++) {
      let row = []
      for (let c = 0; c < maxCol; c++) {
        row.push(this.renderCard(count))
        count++
      }
      cards.push(<div>{row}</div>)
    }
    return cards
  }
  render(){
    return(
      <div className="Panel">
        {this.createAllCards()}
      </div>
    );
  }
}

class Game extends Component {
  render() {
    return (
      <div className="App">
      <Panel />
      </div>
    );
  }
}

export default Game;
