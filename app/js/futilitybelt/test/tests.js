var timing = futilitybelt.timing;

test('Repeater tests', function() {
	var checker = 0;
	var callback = function() {
		checker++;
	}
	var rep = new timing.Repeater(callback, 1);

	ok( rep, 'There is a thing called Repeater.');

	ok( rep.start, 'There is a method called start');	
	
	rep.start();
	setTimeout(rep.stop, 500);
}); 
