package gateway;

import com.intuit.karate.junit5.Karate;

class GatewayTestRunner {
    
    @Karate.Test
    Karate testGateway() {
        return Karate.run("gateway").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testConfigurations() {
        return Karate.run("configurations").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testParameters() {
        return Karate.run("parameters").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testChangeLogs() {
        return Karate.run("changelogs").relativeTo(getClass());
    }
    
    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:gateway").tags("~@ignore");
    }
}
