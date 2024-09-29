module Jekyll
    class CustomLogger
      def self.init_logger
        logger = Logger.new(STDOUT)
        logger.level = Logger::DEBUG # You can set this to any desired level
        Jekyll.logger = logger
      end
    end
  end
  
  Jekyll::CustomLogger.init_logger  