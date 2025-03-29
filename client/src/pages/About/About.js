import React from "react";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import './About.css';

function About() {
    return (
        <div className="pageWrapper">
            <Nav />
            <main>
                <section className="enginepart">
                    <h1>Inspiration</h1>
                    <div>
                        <p>
                            I have previously had spouts of fascination into the chess world - watching YouTube videos, a documentary on <a href="https://www.youtube.com/watch?v=HwF229U2ba8">Deep Blue</a>, and playing myself up to about 
                            1600 elo on <a href="https://chess.com">Chess.com</a>. Consequently, chess engines have intrigued my curiosity as I wondered how a game so 
                            utterly deep and complex could be so easily conquered by a machine. After delving into chess programming, I decided to 
                            create my own engine as a side project during the semester - hoping for it to achieve an elo of at least 2000.
                        </p>
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <div className="links">
                    <a href="#search">Search Algorithm</a>
                    <a href="#evaluation">Evaluation</a>
                    <a href="#hashtable">Transposition Table</a>
                    <a href="https://github.com/DirtySandals/SandalBotV2"><i className="fa-brands fa-github"></i>Code</a>
                </div>
                <div className="horizontalLine"></div>
                <section id="search" className="enginepart">
                    <h1>Search Algorithm</h1>
                    <div className="partList">
                        <p>
                            SandalBot's search algorithm is designed to maximize its efficiency and effectiveness in evaluating chess positions through shear search speed and 
                            intelligent focus on the search space.
                        </p>
                        <div className="paragraph">
                            <h3>Negamax Search with Alpha-Beta Pruning</h3>
                            <p>
                                <i>Negamax Search</i> is a variant of the minimax algorithm, simplifying the implementation by treating both players' perspectives symmetrically - 
                                alternating the signs of the evaluation scores. Negamax search theoretically solves any position, however, due to the breadth of chess search trees, 
                                is wildly inefficient. <i>Alpha-Beta Pruning</i> is an optimisation technique that reduces the number of nodes evaluated in the search tree. It 
                                keeps track of two values, alpha and beta, representing the minimum score that the maximizing player is assured and the maximum score that the 
                                minimizing player is assured, respectively. Branches of the search tree that cannot possibly affect the final decision are pruned, improving efficiency.
                            </p>
                        </div>
                        <div className="paragraph">
                            <div className="partcontainer">
                                <h3>Iterative Deepening</h3>
                                <div>
                                    <p>
                                        This technique repeatedly runs a depth-limited search, incrementally increasing the depth limit. Whilst counter-intuitive, searching shorter 
                                        depths first provides a reliable heuristic by providing the principal variation found in the previous search to the next. Additionally, iterative 
                                        deepening also allows for time-dependent searches - no longer having to wait until depth is searched or interrupted. It allows the engine to use 
                                        time more effectively, providing a best move even if the search is interrupted before completion.
                                    </p>
                                    <img src="ideep.png" width="300px"></img>
                                </div>
                            </div>
                        </div>
                        <div className="paragraph">
                            <h3>Move Ordering</h3>
                            <p>
                                SandalBot orders moves based on their likelihood of being good, which helps in improving the efficiency of alpha-beta pruning - ultimately shortening the 
                                breadth of the search. Moves are heuristically assigned scores based on several factors to predict the likelihood that a given move is beneficial to the 
                                position.
                            </p>
                            <p>Moves are heuristically evaluated based on:</p>
                            <ul>
                                <li>Presence in transposition table (See more later)</li>
                                <li>Captures</li>
                                <li>Checks</li>
                                <li>En Passant</li>
                                <li>Promotions</li>
                            </ul>
                        </div>
                        <div className="paragraph">
                            <h3>Quiescence Search</h3>
                            <p>
                                In a traditional alpha-beta negamax search, the board position is explored until a specified depth where it is evaluated as a static position. The static 
                                evaluation is especially prone to the horizon effect in noisy positions, where numerous captures are possible and the current static evaluation is wildly 
                                inaccurate due to unexplored capture sequences. Quiescence search minimises the horizon effect by statically evaluating the position and continuing 
                                capture sequences until a quiet position (no immediate captures) is reached.
                            </p>
                            <img src="alphabetaquiescence.png"></img>
                        </div>
                        <div className="paragraph">
                            <h3>Depth Extensions</h3>
                            <p>
                                The search depth is extended in certain critical situations, such as when the position involves a check or a promotion. Extending lines with a check and/or 
                                promotion ensures that the search provides more resources in promising positions to thoroughly evaluate critical attacking lines (hopefully pruning more 
                                positions). However, these extensions are limited to prevent the search tree from growing too large, ensuring that the search remains manageable.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Late Move Reductions</h3>
                            <p>
                                One of the major bottlenecks of the engine is the breadth of the search tree, as positions with significantly higher average move counts consequently 
                                reach lower depths within allotted times. Whilst this bottleneck has been addressed with the implementation of alpha-beta pruning, optimisation in the 
                                breadth of the search tree can be achieved through late move reductions. In tandem with the move ordering scheme, moves that appear later in the move 
                                order are given a reduced search depth. This reduction is based on the assumption that these moves are heuristically less likely to be good. This technique 
                                helps in focusing computational resources on more promising moves. However, given the inherent inaccuracy in move ordering heuristics, moves given a late 
                                move reduction that provide promising results are searched again at a full depth.
                            </p>
                        </div>
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <section id="evaluation" className="enginepart">
                    <h1>Evaluation</h1>
                    <div className="partList">
                        <p>
                            SandalBot's static position evaluation is comprehensive, taking into account various strategic and tactical elements of the game. Each aspect of the evaluation 
                            process is evaluated for each side, and the subsequent difference is the evaluation score. The accuracy of the static evaluation also aids the search algorithm 
                            in pruning branches through the polarisation of good and bad positions. Here's how it evaluates different aspects:
                        </p>

                        <div className="paragraph">
                            <h3>Static Piece Values</h3>
                            <p>
                                Each piece is assigned a static value based on its relative strength. For instance, pawns are valued at 100, knights at 320, bishops at 330, rooks at 500, 
                                and the queen at 900. This is the most primitive aspect of the evaluation process but also the most significant.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Piece Square Evaluation Tables</h3>
                            <p>
                                These tables assign values to pieces based on their position on the board. Certain squares are more advantageous for certain pieces, and these tables 
                                help in adjusting the static piece values accordingly. These tables are especially important in the opening and middle game where piece placement is not 
                                necessarily determined by tactical evaluation, but rather by patterns seen as generally beneficial to the position.
                            </p>
                        </div>
                            <div className="paragraph">
                            <h3>Open Files and Diagonals</h3>
                            <p>
                                SandalBot evaluates the control of open files (for rooks and queens) and diagonals (for bishops and queens) by checking if there are orthogonal or diagonal 
                                moving pieces on them. SandalBot defines open lines as files/diagonals with zero pawns, and semi-open lines as files/diagonals with one pawn. Whilst the 
                                definition for semi-open lines may lead to inaccurate readings in locked positions, the heuristic allows for efficient evaluation and is reflected in the 
                                bot's preference to take advantage of open files/diagonals and stacking pieces along them. It also considers whether these lines pass through the king's 
                                zone (squares around the king), which can be crucial for evaluating king safety.
                            </p>
                            </div>
                        <div className="paragraph">
                            <h3>Pawn Islands</h3>
                            <p>
                                <i>Pawn islands</i> are defined as pawns with no friendly pawns along adjacent files - they are generally weaker and harder to defend than pawns within a 
                                pawn chain. Due to their inferiority, each pawn island is penalised.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Passed Pawns</h3>
                            <p>
                                <i>Passed pawns</i> (pawns with no opposing pawns blocking their way to promotion) are given bonuses. SandalBot checks the squares in front of the pawn 
                                and two adjacent files to determine whether the pawn is passed, encouraging the advancement of passed pawns in endgames.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Pawn Shield</h3>
                            <p>
                                In the middlegame, the <i>Pawn Shield</i> (pawns directly in front of the king) is important for the king's safety. SandalBot evaluates this and punishes 
                                positions where these pawns are absent, making the king more vulnerable.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Pawn Shield</h3>
                            <p>
                                In opening and middle game phases, king safety is often accompanied by pawns 'shielding' the king - reducing the likelihood of checks and more friendly 
                                pieces to defend attacks. Penalties occur for any undefended shielding pawns and for any file in front of king that does not contain a shielding pawn.
                                The prioritisation of shield pawns ensures the king does not wander into the open when there are many pieces on the board.
                            </p>
                        </div>
                        <div className="paragraph">
                            <h3>Mopup Evaluation in Winning Endgames</h3>
                            <p>
                                In winning endgames, SandalBot encourages the involvement of the king, known as <i>Mopup Evaluation</i>. The king should actively participate in converting 
                                the advantage to a win, and this is factored into the evaluation. King participation in winning endgames is crucial in converting checkmates which require 
                                king involvement.
                            </p>
                        </div>
                    </div>
                </section>
                <div className="horizontalLine"></div>
                <section id="hashtable" className="enginepart">
                    <h1>Transposition Table</h1>
                    <div className="partcontainer">
                        <div className="paragraph">
                            <p>
                                SandalBot employs a transposition table to enhance its efficiency and accuracy in evaluating chess positions. This table is essentially a cache that 
                                stores the results of previously evaluated positions, allowing the engine to recognize and reuse these results when the same positions are encountered again, 
                                even if they are reached through different move sequences. By avoiding redundant calculations, the transposition table significantly reduces the 
                                computational burden, speeding up the search process. It also helps in better managing the alpha-beta pruning by providing already known upper and lower 
                                bounds for positions, further enhancing pruning efficiency. The entries in the transposition table include information such as the position's evaluation 
                                score, the depth at which it was evaluated, and the best move found, ensuring that SandalBot can make informed and swift decisions, leveraging its past 
                                calculations.
                            </p>
                            <img src="transpositionExample.png"></img>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

export default About;