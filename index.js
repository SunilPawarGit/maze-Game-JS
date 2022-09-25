
/// Sections 22nd 
const {Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Events,
    //MouseConstraint,Mouse
}=Matter;

const cellsH=6;
const cellsV=6;
const width=window.innerWidth;
const height=window.innerHeight;

const unitLengthX = width/cellsV;
const unitLengthY = width/cellsH;

const engine=Engine.create();
engine.world.gravity.y=0;
const {world}=engine;
const render=Render.create({
    element:document.body,
    engine:engine,
    options:{
        wireframes:false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);
// const shape=Bodies.rectangle(200,200,50,50,{
//     isStatic:true,
// });
// World.add(world,shape);
// World.add(world,MouseConstraint.create(engine,{
//     mouse:Mouse.create(render.canvas)
// }))
//walls 
const walls=[
    Bodies.rectangle(width/2,0,width,2,{isStatic:true}),
    Bodies.rectangle(width/2,height,width,2,{isStatic:true}),
    Bodies.rectangle(0,height/2,2,height,{isStatic:true}),
    Bodies.rectangle(width,height/2,2,height,{isStatic:true}),
]

World.add(world,walls);

//Random shapes
// for (let i=0;i<30;i++){
//     if(Math.random() < 0.5){
//         World.add(world,Bodies.rectangle(Math.random()*width,Math.random()*height,50,50));
//     }else{
//         World.add(world,Bodies.circle(Math.random()*width,Math.random()*height,35,{
//             render:{
//                     fillStyle:'red',
//                     }
//             }));
//     }
// }

// Maze Grneration

const shuffle=(arr)=>{
    let counter=arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random()*counter);
        counter--;

        const temp=arr[counter];
        arr[counter]=arr[index];
        arr[index]=temp;
    }
    return arr;
};



const grid=Array(cellsV)
    .fill(null)
    .map(()=>Array(cellsH)
    .fill(false));

const verticals=Array(cellsV)
    .fill(null)
    .map(()=>Array(cellsH-1).fill(false));
const horizontals=Array(cellsV-1)
    .fill(null)
    .map(()=>Array(cellsH).fill(false));

const startRow=Math.floor(Math.random()*cellsV);
const startColumn=Math.floor(Math.random()*cellsH);

const stepThoughCell=(row,column)=>{
    // If i have visited the cell at [row,column],then return.
    if(grid[row][column]){
        return;
    }
    // Mark this cell as being visited
    grid[row][column]=true;
    //Assemble randomly-orderred list of neighbors
    const neighbors=shuffle([
        [row-1,column,'up'],
        [row,column+1,'right'],
        [row+1,column,'down'],
        [row,column-1,'left']
    ]);
    
    // for each neighbor...
    for(let neighbor of neighbors){

        const [nextRow,nextColumn,direction]=neighbor;

        // see if that neighbor is out of bounds
        if(nextRow <0||
             nextRow >= cellsV ||
              nextColumn < 0 || 
              nextColumn >= cellsH
              ){
            continue;
        }
        // if we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn]){
            continue;
        }
        // Remove a wall from either horizontals or verticals
        if(direction==='left'){
            verticals[row][column-1]=true;

        }else if(direction ==='right'){
            verticals[row][column]=true;
        }else if(direction ==='up'){
            horizontals[row-1][column]=true;
        }else if(direction ==='down'){
            horizontals[row][column]=true;
        }

        stepThoughCell(nextRow,nextColumn);
    }
    // Visit that next cell.
};
stepThoughCell(startRow,startColumn);
// console.log(grid);

horizontals.forEach((row,rowIndex) => {
    row.forEach((open,columnIndex)=>{
        if(open){
            return;
        }
        const wall=Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX/2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            5,
            {
                label:'wall',
                isStatic:true,
                render:{
                    fillStyle:'aqua',
                }
            }
        );
        World.add(world,wall);
   });
});


verticals.forEach((row,rowIndex) => {
    row.forEach((open,columnIndex)=>{
        if(open){
            return;
        }
        const wall=Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX ,
            rowIndex * unitLengthY + unitLengthY/2,
            5,
            unitLengthY,
            {
                label:'wall',
                isStatic:true,
                render:{
                    fillStyle:'lime'
                }
            }
        );
        World.add(world,wall);
   });
});

// Goal
const goal= Bodies.rectangle(
    width-unitLengthX/2,
    height-unitLengthY/2,
    unitLengthX * 0.5,
    unitLengthY * 0.5,
    {
        label:'goal',
        isStatic:true,
        render:{
                    fillStyle:'green',
                },
        
    }
);
World.add(world,goal);

//Ball
const ballRadius=Math.min(unitLengthX,unitLengthY)/4;
const ball=Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {
        label:'ball'
      
    }
);
World.add(world,ball);

document.addEventListener('keydown',event=>{
    const {x ,y}=ball.velocity;
    // console.log(x,y)
    if(event.key === 'w' || event.key === 'ArrowUp'){
        Body.setVelocity(ball,{x , y: y - 5});
    }
    if(event.key === 'a' || event.key === 'ArrowLeft'){
        Body.setVelocity(ball,{x: x-5, y});
    }
    if(event.key === 'd' || event.key === 'ArrowRight'){
        Body.setVelocity(ball,{x:x+5 , y});
    }
    if(event.key === 's' || event.key === 'ArrowDown'){
        Body.setVelocity(ball,{x , y: y + 5});
    }
});

//  Win Conditions

Events.on(engine,'collisionStart',event=>{
    event.pairs.forEach((collision)=>{
        const labels =['ball','goal'];
        if(labels.includes(collision.bodyA.label) && 
        labels.includes(collision.bodyB.label)
        ){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y=1;
            world.bodies.forEach(body=>{
                if(body.label === 'wall'){
                    Body.setStatic(body,false);
                }
            })
        }
    })
});