<?php

$rand = rand(1111111111,9999999999);

//header de content type
header("Content-type: text/vnd.wap.wml");

echo "<?xml version=\"1.0\"?>";
?>
<!DOCTYPE wml PUBLIC "-//WAPFORUM//DTD WML 1.1//EN" "http://www.wapforum.org/DTD/wml_1_1.dtd">
<wml>
<head>
<meta forua="true" http-equiv="Cache-Control" content="must-revalidate"/>
</head>
<card id="Test" newcontext="true" title="Test">
<p>
<img src="a.php?cb=<?php echo $rand ?>" alt="Img"/>
</p>
</card>
</wml>
