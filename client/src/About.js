import React from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import './About.css';

function About() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <div className="links">
                    <a href="#goals">Goals</a>
                    <a href="#search">Search Algorithm</a>
                    <a href="#evaluation">Evaluation</a>
                    <a href="#hashtable">Transposition Table</a>
                    <a href="https://github.com/DirtySandals/SandalBotV2"><i class="fa-brands fa-github"></i>Code</a>
                </div>
                <div className="horizontalLine"></div>
                <section id="goals" className="enginepart">
                    <h1>Goals</h1>
                    <div>
                        Non cupidatat pariatur dolor ut adipisicing labore laborum enim. Lorem anim proident labore cupidatat anim est. Tempor minim elit velit laborum deserunt incididunt pariatur labore. Ex sit exercitation nisi incididunt ullamco magna veniam.
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <section id="search" className="enginepart">
                    <h1>Search Algorithm</h1>
                    <div>
                        <p>SandalBot's search algorithm is a sophisticated method designed to maximize its efficiency and effectiveness in evaluating chess positions. Here's a detailed explanation of its components:</p>
                        <div className="paragraph">
                            <h3>Negamax Search with Alpha-Beta Pruning</h3>
                            <p>Negamax Search: A variant of the minimax algorithm, negamax simplifies the implementation by treating both players' perspectives symmetrically. It evaluates positions by alternating the signs of the evaluation scores.
                            Alpha-Beta Pruning: An optimization technique that reduces the number of nodes evaluated in the search tree. It keeps track of two values, alpha and beta, which represent the minimum score that the maximizing player is assured and the maximum score that the minimizing player is assured, respectively. Branches of the search tree that cannot possibly affect the final decision are pruned, improving efficiency.</p>
                        </div>
                        <div className="paragraph">
                            <div className="partcontainer">
                                <div>
                                    <h3>Iterative Deepening</h3>
                                    <p>This technique repeatedly runs a depth-limited search, incrementally increasing the depth limit. It allows the engine to use time more effectively, providing a best move even if the search is interrupted before completion. It also helps in improving move ordering as the results from shallower searches can inform deeper ones.</p>
                                </div>
                                <img src="ideep.png" height="300px"></img>
                            </div>
                        </div>
                        <div className="paragraph">
                            <h3>Heuristic Move Ordering</h3>
                            <p>SandalBot orders moves based on their likelihood of being good, which helps in improving the efficiency of alpha-beta pruning. Moves likely to be strong, such as captures, checks, and promotions, are evaluated first.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Quiescence Search</h3>
                            <p>This search technique extends the evaluation beyond the regular depth limit in "noisy" positions where captures and checks are possible. It aims to avoid the horizon effect by continuing to search until a quiet position (no immediate tactical threats) is reached.</p>
                            <img src="alphabetaquiescence.png"></img>
                        </div>
                        <div className="paragraph">
                            <h3>Depth Extensions</h3>
                            <p>The search depth is extended in certain critical situations, such as when the position involves a check or a promotion. These extensions are limited to prevent the search tree from growing too large, ensuring that the search remains manageable.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Late Move Reductions</h3>
                            <p>Moves that are evaluated later in the move ordering are given a reduced search depth. This reduction is based on the assumption that these moves are less likely to be good. This technique helps in focusing computational resources on more promising moves.</p>
                        </div>
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <section id="evaluation" className="enginepart">
                    <h1>Evaluation</h1>
                    <div>
                        <p>SandalBot's position evaluation is comprehensive, taking into account various strategic and tactical elements of the game. Here's how it evaluates different aspects:</p>

                        <div className="paragraph">
                            <h3>Static Piece Values</h3>
                            <p>Each piece is assigned a static value based on its relative strength. For instance, pawns are typically valued at 1, knights and bishops at 3, rooks at 5, and the queen at 9.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Piece Square Evaluation Tables</h3>
                            <p>These tables assign values to pieces based on their position on the board. Certain squares are more advantageous for certain pieces, and these tables help in adjusting the static piece values accordingly.</p>
                        </div>
                            <div className="paragraph">
                            <h3>Open Files and Diagonals</h3>
                        <p>SandalBot evaluates the control of open files (for rooks) and diagonals (for bishops and queens) by checking if there are orthogonal or diagonal moving pieces on them. It also considers whether these lines pass through the king's zone (squares around the king), which can be crucial for both attack and defense.</p>
                            </div>
                        <div className="paragraph">
                            <h3>Pawn Islands</h3>
                            <p>Pawn islands (groups of connected pawns) are evaluated, with a penalty for having multiple isolated islands. This is because isolated pawns are generally weaker and harder to defend.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Passed Pawns</h3>
                            <p>Passed pawns (pawns with no opposing pawns blocking their way to promotion) are given bonuses. SandalBot checks the squares in front of the pawn and two adjacent files to determine the bonus, encouraging the advancement of passed pawns.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Pawn Shield</h3>
                            <p>In the middlegame, the pawn shield (pawns directly in front of the king) is important for the king's safety. SandalBot evaluates this and punishes positions where these pawns are absent, making the king more vulnerable.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Vacant Pawns</h3>
                            <p>Positions where expected pawns are missing, particularly in the pawn shield, are penalized. This encourages maintaining a solid pawn structure around the king.</p>
                        </div>
                        <div className="paragraph">
                            <h3>Mopup Evaluation in Winning Endgames</h3>
                            <p>In winning endgames, SandalBot encourages the involvement of the king, known as mopup evaluation. The king should actively participate in converting the advantage to a win, and this is factored into the evaluation.
                            By combining these evaluation strategies, SandalBot can effectively assess the strengths and weaknesses of a position, leading to better decision-making during the game.</p>
                        </div>
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <section id="hashtable" className="enginepart">
                    <h1>Transposition Table</h1>
                    <div className="partcontainer">
                        <div>
                            <p>SandalBot employs a transposition table to enhance its efficiency and accuracy in evaluating chess positions. This table is essentially a cache that stores the results of previously evaluated positions, allowing the engine to recognize and reuse these results when the same positions are encountered again, even if they are reached through different move sequences. By avoiding redundant calculations, the transposition table significantly reduces the computational burden, speeding up the search process. It also helps in better managing the alpha-beta pruning by providing already known upper and lower bounds for positions, further enhancing pruning efficiency. The entries in the transposition table typically include information such as the position's evaluation score, the depth at which it was evaluated, and the best move found, ensuring that SandalBot can make informed and swift decisions, leveraging its past calculations.</p>
                        </div>
                        <img src="transpositionExample.png" height="300px"></img>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default About;