export const labelMap = {
    1:{name:'hammer', color:'red'},
    2:{name:'axe', color:'yellow'},
    3:{name:'knife', color:'blue'},
    4:{name:'pliers', color:'green'},
    5:{name:'tape_measure', color:'lime'},
}

export const drawRect = (boxes, classes, scores, threshold, imgWidth, imgHeight, ctx)=>{
    for(let i=0; i<=boxes.length; i++){
        if(boxes[i] && classes[i] && scores[i]>threshold){
            const [y,x,height,width] = boxes[i]
            const text = classes[i]

            ctx.strokeStyle = labelMap[text]['color']
            ctx.lineWidth = 10
            ctx.fillStyle = 'white'
            ctx.font = '30px Arial'

            ctx.beginPath()
            ctx.fillText(labelMap[text]['name'] + ' - ' + Math.round(scores[i]*100)/100, x*imgWidth, y*imgHeight-10)
            ctx.rect(x*imgWidth, y*imgHeight, width*imgWidth/2, height*imgHeight/2);
            ctx.stroke()
        }
    }
}